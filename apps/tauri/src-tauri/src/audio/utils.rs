pub fn above_noise_supression_threshold(buffer: &Vec<f32>, start_sample: usize, sample_count: usize, threshold: f32) -> bool {
    let mut above_threshold = false;
    let min_threshold = threshold / 100.0;
    for i in start_sample..start_sample + sample_count {
        if buffer[i] > min_threshold {
            above_threshold = true;
            break;
        }
    }
    above_threshold
}