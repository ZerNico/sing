use crate::error::AppError;
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use ringbuf::{traits::RingBuffer, HeapRb};
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
}

impl Recorder {
    pub fn new(options: Vec<MicrophoneOptions>) -> Result<Self, AppError> {
        let (stop_tx, stop_rx) = mpsc::channel();

        let processors: Vec<_> = options.clone().into_iter().map(Processor::new).collect();
        let processors_clone = processors.clone();

        let thread_handle =
            thread::spawn(move || Self::run_recording_loop(options, processors_clone, stop_rx));

        Ok(Self {
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
}

impl Drop for Recorder {
    fn drop(&mut self) {
        let _ = self.stop();
    }
}

#[derive(Clone)]
pub struct Processor {
    rb: Arc<Mutex<HeapRb<f32>>>,
    options: MicrophoneOptions,
}

impl Processor {
    pub fn new(options: MicrophoneOptions) -> Self {
        Self {
            rb: Arc::new(Mutex::new(HeapRb::new(48000))),
            options,
        }
    }

    pub fn push_audio_data(&self, data: &[f32]) {
        if let Ok(mut rb) = self.rb.lock() {
            println!("Pushing audio data");
            rb.push_slice_overwrite(data);
        }
    }
}
