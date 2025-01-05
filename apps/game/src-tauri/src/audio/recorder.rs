use crate::error::AppError;
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use dywapitchtrack::DywaPitchTracker;
use ringbuf::{
    traits::{Consumer, RingBuffer},
    HeapRb,
};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    sync::{mpsc, Arc, Mutex},
    thread,
};

#[derive(Debug, Serialize, Deserialize, specta::Type, Clone)]
pub struct MicrophoneOptions {
    name: String,
    channel: i32,
}

pub struct Recorder {
    stop_tx: mpsc::Sender<()>,
    thread_handle: Option<thread::JoinHandle<Result<(), AppError>>>,
    processors: Vec<Processor>,
}

impl Recorder {
    pub fn new(options: Vec<MicrophoneOptions>, samples_per_beat: usize) -> Result<Self, AppError> {
        let (stop_tx, stop_rx) = mpsc::channel();

        let processors: Vec<_> = options
            .clone()
            .into_iter()
            .map(|o| Processor::new(o, samples_per_beat))
            .collect();
        let processors_clone = processors.clone();

        let thread_handle =
            thread::spawn(move || Self::run_recording_loop(options, processors_clone, stop_rx));

        Ok(Self {
            processors,
            thread_handle: Some(thread_handle),
            stop_tx,
        })
    }

    fn run_recording_loop(
        options: Vec<MicrophoneOptions>,
        processors: Vec<Processor>,
        stop_rx: mpsc::Receiver<()>,
    ) -> Result<(), AppError> {
        let host = cpal::default_host();
        let devices = host.devices()?;
        let mut streams = Vec::new();

        for device in devices {
            let device_name = device.name()?;
            let options_for_device: HashMap<_, _> = options
                .clone()
                .into_iter()
                .enumerate()
                .filter(|(_, mic)| mic.name == device_name)
                .collect();

            if options_for_device.is_empty() {
                continue;
            }

            if let Ok(config) = device.default_input_config() {
                let channels = config.channels() as usize;
                let processors = processors.clone();

                for (index, _) in &options_for_device {
                    processors[*index].set_sample_rate(config.sample_rate().0 as i32);
                }

                let input_data_fn = move |data: &[f32], _: &cpal::InputCallbackInfo| {
                    for (&index, option) in &options_for_device {
                        let buffer: Vec<f32> = data
                            .iter()
                            .skip(option.channel as usize)
                            .step_by(channels)
                            .copied()
                            .collect();

                        processors[index].push_audio_data(&buffer);
                    }
                };

                let stream = device.build_input_stream(
                    &config.into(),
                    input_data_fn,
                    |err| eprintln!("Stream error: {}", err),
                    None,
                )?;

                stream.play()?;
                streams.push(stream);
            }
        }

        let _ = stop_rx.recv();

        Ok(())
    }

    pub fn stop(&mut self) -> thread::Result<Result<(), AppError>> {
        let _ = self.stop_tx.send(());
        self.thread_handle
            .take()
            .map(|h| h.join())
            .unwrap_or(Ok(Ok(())))
    }

    pub fn get_pitch(&self, index: usize) -> f32 {
        self.processors.get(index).map_or(0.0, |p| p.get_pitch())
    }
}

impl Drop for Recorder {
    fn drop(&mut self) {
        let _ = self.stop();
    }
}

#[derive(Clone)]
pub struct Processor {
    rb: Arc<Mutex<HeapRb<f32>>>,
    pitchtracker: Arc<Mutex<DywaPitchTracker>>,
    options: MicrophoneOptions,
    samples_per_beat: usize,
}

impl Processor {
    pub fn new(options: MicrophoneOptions, samples_per_beat: usize) -> Self {
        let pitchtracker = DywaPitchTracker::new();

        Self {
            rb: Arc::new(Mutex::new(HeapRb::new(48000))),
            options,
            pitchtracker: Arc::new(Mutex::new(pitchtracker)),
            samples_per_beat: samples_per_beat,
        }
    }

    pub fn push_audio_data(&self, data: &[f32]) {
        if let Ok(mut rb) = self.rb.lock() {
            rb.push_slice_overwrite(data);
        }
    }

    pub fn set_sample_rate(&self, sample_rate: i32) {
        let mut pitchtracker = self.pitchtracker.lock().unwrap();
        pitchtracker.sample_rate_hz = sample_rate as i32;
    }

    pub fn get_pitch(&self) -> f32 {
        let rb = self.rb.lock().unwrap();
        let slices = rb.as_slices();
        let samples = [slices.0, slices.1].concat();
        drop(rb);

        let mut pitchtracker = self.pitchtracker.lock().unwrap();
        let start_sample = samples.len() - self.samples_per_beat;

        let mut pitch = -1.0;

        pitch = pitchtracker.compute_pitch(&samples, start_sample, self.samples_per_beat);

        if pitch <= 0.0 {
            pitchtracker.clear_pitch_history();
        }

        pitch
    }
}
