use std::sync::{Arc, Mutex};

use ringbuf::{HeapRb, Rb};

use super::{dywapitchtrack::DywaPitchTracker, utils::above_noise_supression_threshold};

#[derive(Clone)]
pub struct Processor {
    rb: Arc<Mutex<HeapRb<f32>>>,
    pitchtrack: Arc<Mutex<DywaPitchTracker>>,
    samples_per_beat: Arc<Mutex<i32>>,
}

impl Processor {
    pub fn new(size: usize) -> Self {
        let mut buffer = HeapRb::new(size);
        buffer.push_slice_overwrite(&vec![0.0; 48000]);

        Self {
            rb: Arc::new(Mutex::new(buffer)),
            pitchtrack: Arc::new(Mutex::new(DywaPitchTracker::new())),
            samples_per_beat: Arc::new(Mutex::new(0)),
        }
    }

    pub fn set_sample_rate(&mut self, sample_rate: i32) {
        let mut pitchtrack = self.pitchtrack.lock().unwrap();
        pitchtrack.sample_rate_hz = sample_rate;
    }

    pub fn set_samples_per_beat(&mut self, samples_per_beat: i32) {
        *self.samples_per_beat.lock().unwrap() = samples_per_beat;
    }

    pub fn get_pitch(&self) -> f32 {
        let rb = self.rb.lock().unwrap();
        let slices = rb.as_slices();
        let combined_slice = [slices.0, slices.1].concat();
        let combined_slice_len = combined_slice.len() as i32;

        let mut pitchtrack = self.pitchtrack.lock().unwrap();
        let samples_per_beat = self.samples_per_beat.lock().unwrap();
        let start_sample = combined_slice_len - *samples_per_beat;
        let sample_count = *samples_per_beat;

        let mut pitch = -1.0;

        let is_above_threshold = above_noise_supression_threshold(
            &combined_slice,
            start_sample as usize,
            sample_count as usize,
            1.0,
        );

        if is_above_threshold {
            pitch = pitchtrack.compute_pitch(
                combined_slice,
                combined_slice_len as i32 - *samples_per_beat,
                *samples_per_beat,
            );
        }

        if pitch <= 0.0 {
            pitchtrack.clear_pitch_history();
        }

        pitch
    }

    pub fn push_slice(&self, slice: &[f32]) {
        let mut rb = self.rb.lock().unwrap();
        rb.push_slice_overwrite(slice);
    }
}
