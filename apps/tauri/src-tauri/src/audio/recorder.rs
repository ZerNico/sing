use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::{
    collections::HashMap,
    sync::{mpsc, Mutex},
    thread,
};

use super::processor::Processor;

const MAX_SAMPLE_RATE: usize = 48000;
pub const MICROPHONE_COUNT: usize = 2;

pub struct Recorder {
    processors: [Processor; MICROPHONE_COUNT],
    stream_thread_sender: Mutex<Option<mpsc::Sender<()>>>,
    main_thread_receiver: Mutex<Option<mpsc::Receiver<()>>>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct MicrophoneOptions {
    pub name: String,
    pub channel: usize,
    pub gain: f32,
    pub threshold: f32,
}

impl Recorder {
    pub fn new() -> Self {
        let processors = [0; MICROPHONE_COUNT].map(|_| Processor::new(MAX_SAMPLE_RATE));

        Self {
            processors,
            stream_thread_sender: Mutex::new(None),
            main_thread_receiver: Mutex::new(None),
        }
    }

    pub fn start_recording(&self, microphones: Vec<MicrophoneOptions>, samples_per_beat: i32) {
        let mut stream_thread_sender = self.stream_thread_sender.lock().unwrap();
        if stream_thread_sender.is_some() {
            return;
        }
        let mut main_thread_receiver = self.main_thread_receiver.lock().unwrap();

        let (tx1, rx1) = mpsc::channel();
        *stream_thread_sender = Some(tx1);
        let (tx2, rx2) = mpsc::channel();
        *main_thread_receiver = Some(rx2);

        //get the first X microphones
        let max_mics = microphones
            .into_iter()
            .take(MICROPHONE_COUNT)
            .collect::<Vec<MicrophoneOptions>>();

        let processors = self.processors.clone();

        thread::spawn(move || {
            let host = cpal::default_host();
            let devices = host.devices().unwrap();
            let mut streams = Vec::new();

            for (_, device) in devices.enumerate() {
                let mut mics_for_device = HashMap::new();

                let mics = max_mics.clone();
                for (index, mic) in mics.iter().enumerate() {
                    if mic.name == device.name().unwrap() {
                        mics_for_device.insert(index, mic.clone());
                    }
                }

                if mics_for_device.is_empty() {
                    continue;
                }

                let mut processors = processors.clone();

                if let Ok(config) = device.default_input_config() {
                    let channels = config.channels() as usize;

                    for (index, mic) in mics_for_device.iter() {
                        processors[*index].set_sample_rate(config.sample_rate().0 as i32);
                        processors[*index].set_samples_per_beat(samples_per_beat);
                        processors[*index].set_options(mic);
                    }

                    let input_data_fn = move |data: &[f32], _: &cpal::InputCallbackInfo| {
                        for (_, microphone) in mics_for_device.iter().enumerate() {
                            // audio data is interleaved, so we need to get every nth element from the data based on which channel is needed for the mic
                            let buffer: Vec<f32> = data
                                .iter()
                                .enumerate()
                                .filter(|(i, _)| i % channels == microphone.1.channel)
                                .map(|(_, &f)| f)
                                .collect();

                            processors[*microphone.0].push_slice(&buffer);
                        }
                    };
                    let config = &config.into();
                    let input_stream = device.build_input_stream(&config, input_data_fn, |err| {
                        eprintln!("Error: {}", err);
                    });
                    if let Ok(stream) = input_stream {
                        streams.push(stream);
                    }
                }
            }
            for stream in streams.iter() {
                stream.play().unwrap();
            }

            rx1.recv().unwrap();
            for stream in streams {
                drop(stream)
            }
            tx2.send(()).unwrap();
        });
    }

    pub fn stop_recording(&self) {
        let mut stream_thread_sender = self.stream_thread_sender.lock().unwrap();
        if stream_thread_sender.is_none() {
            return;
        }
        let mut main_thread_receiver = self.main_thread_receiver.lock().unwrap();

        stream_thread_sender.take().unwrap().send(()).unwrap();
        main_thread_receiver.take().unwrap().recv().unwrap();
    }

    pub fn get_pitch(&self, microphone: usize) -> f32 {
        if microphone >= MICROPHONE_COUNT {
            return 0.0;
        }
        self.processors[microphone].get_pitch()
    }
}
