use std::{sync::{Arc, Mutex, RwLock}, os::windows::process, time::Instant};

use ringbuf::{HeapRb, Rb};

use super::{dywapitchtrack::DywaPitchTracker, utils::above_noise_supression_threshold, recorder::MicrophoneOptions};

#[derive(Clone)]
pub struct Processor {
    rb: Arc<Mutex<HeapRb<f32>>>,
    pitchtrack: Arc<Mutex<DywaPitchTracker>>,
    samples_per_beat: Arc<RwLock<i32>>,
    gain: Arc<RwLock<f32>>,
    threshold: Arc<RwLock<f32>>
}

impl Processor {
    pub fn new(size: usize) -> Self {
        let mut buffer = HeapRb::new(size);
        buffer.push_slice_overwrite(&vec![0.0; 48000]);

        Self {
            rb: Arc::new(Mutex::new(buffer)),
            pitchtrack: Arc::new(Mutex::new(DywaPitchTracker::new())),
            samples_per_beat: Arc::new(RwLock::new(0)),
            gain: Arc::new(RwLock::new(1.0)),
            threshold: Arc::new(RwLock::new(2.0))
        }
    }

    pub fn set_sample_rate(&mut self, sample_rate: i32) {
        let mut pitchtrack = self.pitchtrack.lock().unwrap();
        pitchtrack.sample_rate_hz = sample_rate;
    }

    pub fn set_samples_per_beat(&mut self, samples_per_beat: i32) {
        *self.samples_per_beat.write().unwrap() = samples_per_beat;
    }

    pub fn set_options(&mut self, options: &MicrophoneOptions) {
        *self.gain.write().unwrap() = options.gain;
        *self.threshold.write().unwrap() = options.threshold;
    }

    pub fn get_pitch(&self) -> f32 {
        let rb = self.rb.lock().unwrap();
        let slices = rb.as_slices();
        let combined_slice = [slices.0, slices.1].concat();
        let combined_slice_len = combined_slice.len() as i32;

        let mut pitchtrack = self.pitchtrack.lock().unwrap();
        let samples_per_beat = self.samples_per_beat.read().unwrap();
        let start_sample = combined_slice_len - *samples_per_beat;
        let sample_count = *samples_per_beat;

        let threshold = *self.threshold.read().unwrap();

        let mut pitch = -1.0;

        let is_above_threshold = above_noise_supression_threshold(
            &combined_slice,
            start_sample as usize,
            sample_count as usize,
            threshold,
        );

        // create copy of combined slice and apply gain^
        let mut processed_slice = combined_slice.clone();
        let gain = *self.gain.read().unwrap();
        for x in &mut processed_slice {
            *x *= gain;
        }

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
