use dywapitchtrack::DywaPitchTracker;
use ringbuf::{traits::{Consumer, Producer}, HeapRb};

use super::recorder::MicrophoneOptions;

pub struct Processor {
    audio_buffer: HeapRb<f32>,
    pitchtracker: DywaPitchTracker,
    options: MicrophoneOptions,
    samples_per_beat: usize,
}

impl Processor {
    pub fn new(options: MicrophoneOptions, sample_rate: u32, samples_per_beat: usize) -> Self {
        let audio_buffer = HeapRb::new(sample_rate as usize);
        let mut pitchtracker = DywaPitchTracker::new();
        pitchtracker.sample_rate_hz = sample_rate as i32;

        Self {
            audio_buffer,
            pitchtracker,
            options,
            samples_per_beat,
        }
    }

    pub fn push_audio_data(&mut self, data: &[f32]) {
        self.audio_buffer.push_slice(data);
    }

    pub fn get_pitch(&mut self) -> f32 {
        let slices = self.audio_buffer.as_slices();
        let samples = [slices.0, slices.1].concat();
        let start_sample = samples.len() - self.samples_per_beat;

        let mut pitch = -1.0;

        pitch = self
            .pitchtracker
            .compute_pitch(&samples, start_sample, self.samples_per_beat);

        if pitch <= 0.0 {
            self.pitchtracker.clear_pitch_history();
        }

        pitch
    }
}
