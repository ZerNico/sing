/* This code is a Rust port of dywapitchtrack by Antoine Schmitt.
   It implements a wavelet algorithm, described in a paper by Eric Larson and Ross Maddox:
   “Real-Time Time-Domain Pitch Tracking Using Wavelets” of UIUC Physics.

   Note that the original implementation by Schmitt uses double instead of float data type.
 -------
 Dynamic Wavelet Algorithm Pitch Tracking library
 Released under the MIT open source licence

 Copyright (c) 2010 Antoine Schmitt

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

#[derive(Clone)]
pub struct DywaPitchTracker {
    prev_pitch: f32,
    pitch_confidence: i32,

    pub max_flwt_levels: i32,
    pub max_frequency: f32,
    pub difference_levels_n: i32,
    pub maxima_threshold_ratio: f32,
    pub sample_rate_hz: i32,
}

impl DywaPitchTracker {
    pub fn new() -> DywaPitchTracker {
        DywaPitchTracker {
            prev_pitch: -1.0,
            pitch_confidence: -1,
            max_flwt_levels: 6,
            max_frequency: 3000.0,
            difference_levels_n: 3,
            maxima_threshold_ratio: 0.75,
            sample_rate_hz: 44100,
        }
    }

    pub fn compute_pitch(
        &mut self,
        samples: Vec<f32>,
        start_sample: i32,
        sample_count: i32,
    ) -> f32 {
        let mut raw_pitch = self.compute_wavelet_pitch(samples, start_sample, sample_count);
        if self.sample_rate_hz != 44100 {
            raw_pitch *= self.sample_rate_hz as f32 / 44100.0
        }

        return self.dynamic_post_processing(raw_pitch);
    }

    pub fn clear_pitch_history(&mut self) {
        self.prev_pitch = -1.0;
        self.pitch_confidence = -1;
    }

    /* Not used
    pub fn needed_sample_count(min_freq: i32) -> i32 {
      let mut nb_sam: i32 = 3 * 44100 / min_freq;
      nb_sam = DywaPitchTracker::is_power_of_2(nb_sam);
      return nb_sam
    } 
    */

    fn float_abs(a: f32) -> f32 {
        return if a < 0.0 { -a } else { a };
    }

    fn is_power_of_2(value: i32) -> i32 {
        if value == 0 {
            return 1;
        }
        if value == 2 {
            return 1;
        }
        if (value & 0x1) != 0 {
            return 0;
        }
        return DywaPitchTracker::is_power_of_2(value >> 1);
    }

    fn bit_count(value: i32) -> i32 {
        if value == 0 {
            return 0;
        }
        if value == 1 {
            return 1;
        }
        if value == 2 {
            return 2;
        }
        return DywaPitchTracker::bit_count(value >> 1) + 1;
    }

    fn ceil_power_of_2(value: i32) -> i32 {
        if DywaPitchTracker::is_power_of_2(value) != 0 {
            return value;
        }

        if value == 1 {
            return 2;
        }

        let i = DywaPitchTracker::bit_count(value);
        let mut res = 1;
        let mut j = 0;

        while j < i {
            res <<= 1;
            j += 1;
        }
        return res;
    }

    fn floor_power_of_2(value: i32) -> i32 {
        if DywaPitchTracker::is_power_of_2(value) != 0 {
            return value;
        }
        return DywaPitchTracker::ceil_power_of_2(value) / 2;
    }

    fn int_max(a: i32, b: i32) -> i32 {
        let max = if a > b { a } else { b };
        return max;
    }

    fn int_min(a: i32, b: i32) -> i32 {
        let max = if a < b { a } else { b };
        return max;
    }

    fn int_abs(x: i32) -> i32 {
        if x > 0 {
            return x;
        }
        return -x;
    }

    fn power_of_2(n: i32) -> i32 {
        let mut res = 1;
        let mut j = 0;
        while j < n {
            res <<= 1;
            j += 1
        }
        return res;
    }

    fn compute_wavelet_pitch(
        &mut self,
        samples: Vec<f32>,
        start_sample: i32,
        sample_count_g: i32,
    ) -> f32 {
        let mut pitch_f: f32 = 0.0;

        let mut si: f32;
        let mut si1: f32;

        let sample_count = DywaPitchTracker::floor_power_of_2(sample_count_g);

        let mut sam: Vec<f32> = vec![0.0; sample_count as usize];

        {
            let mut index = 0;
            while index < sample_count {
                sam[index as usize] = samples[(index + start_sample) as usize];
                index += 1;
            }
        }

        let mut cur_sam_nb = sample_count;

        let mut distances: Vec<i32> = vec![0; sample_count as usize];
        let mut mins: Vec<i32> = vec![0; sample_count as usize];
        let mut maxs: Vec<i32> = vec![0; sample_count as usize];
        let mut nb_mins: i32;
        let mut nb_maxs: i32;

        let amplitude_treshold: f32;
        let mut the_dc: f32 = 0.0;

        {
            let mut max_value = f32::MIN;
            let mut min_value = f32::MAX;

            let mut i = 0;
            while i < sample_count {
                si = sam[i as usize];
                the_dc = the_dc + si;

                if si > max_value {
                    max_value = si;
                }
                if si < min_value {
                    min_value = si;
                }
                i += 1;
            }

            the_dc /= sample_count as f32;

            max_value -= the_dc;
            min_value -= the_dc;

            let amplitude_max = if max_value > -min_value {
                max_value
            } else {
                -min_value
            };

            amplitude_treshold = amplitude_max * self.maxima_threshold_ratio;
        }

        let mut cur_level = 0;
        let mut cur_mode_distance = -1.0;
        let mut delta: i32;

        loop {
            delta = (44100.0
                / (DywaPitchTracker::power_of_2(cur_level) as f32 * self.max_frequency))
                as i32;

            if cur_sam_nb < 2 {
                return pitch_f;
            }

            let mut dv: f32;
            let mut previous_dv: f32 = -1000.0;

            nb_maxs = 0;
            nb_mins = 0;

            let mut last_min_index = -1000000;
            let mut last_max_index = -1000000;

            let mut find_max = 0;
            let mut find_min = 0;

            let mut i = 1;
            while i < cur_sam_nb {
                si = sam[i as usize] - the_dc;
                si1 = sam[(i - 1) as usize] - the_dc;

                if si1 <= 0.0 && si > 0.0 {
                    find_max = 1;
                    find_min = 0;
                }
                if si1 >= 0.0 && si < 0.0 {
                    find_min = 1;
                    find_max = 0;
                }

                dv = si - si1;

                if previous_dv > -1000.0 {
                    if find_min != 0 && previous_dv < 0.0 && dv >= 0.0 {
                        if DywaPitchTracker::float_abs(si1) >= amplitude_treshold {
                            if i - 1 > last_min_index + delta {
                                mins[nb_mins as usize] = i - 1;
                                nb_mins += 1;
                                last_min_index = i - 1;
                                find_min = 0;
                            } else {
                            }
                        } else {
                        }
                    }

                    if find_max != 0 && previous_dv > 0.0 && dv <= 0.0 {
                        if DywaPitchTracker::float_abs(si1) >= amplitude_treshold {
                            if i - 1 > last_max_index + delta {
                                maxs[nb_maxs as usize] = i - 1;
                                nb_maxs += 1;
                                last_max_index = i - 1;
                                find_max = 0;
                            } else {
                            }
                        } else {
                        }
                    }
                }
                previous_dv = dv;

                i += 1;
            }

            if nb_mins == 0 && nb_maxs == 0 {
                return pitch_f;
            }

            let mut d: i32;

            let mut index = 0;

            while index < distances.len() {
                distances[index as usize] = 0;
                index += 1
            }

            {
                let mut i = 0;
                while i < nb_mins {
                    let mut j = 1;
                    while j < self.difference_levels_n {
                        if i + j < nb_mins {
                            d = DywaPitchTracker::int_abs(
                                mins[i as usize] - mins[(i + j) as usize],
                            );
                            distances[d as usize] = distances[d as usize] + 1;
                        }
                        j += 1;
                    }
                    i += 1;
                }
            }

            {
                let mut i = 0;
                while i < nb_maxs {
                    let mut j = 1;
                    while j < self.difference_levels_n {
                        if i + j < nb_maxs {
                            d = DywaPitchTracker::int_abs(
                                maxs[i as usize] - maxs[(i + j) as usize],
                            );
                            distances[d as usize] = distances[d as usize] + 1;
                        }
                        j += 1;
                    }
                    i += 1;
                }
            }

            let mut best_distance = -1;
            let mut best_value = -1;

            {
                let mut i = 0;
                while i < cur_sam_nb {
                    let mut summed = 0;
                    let mut j = -delta;
                    while j <= delta {
                        if i + j > 0 && i + j < cur_sam_nb {
                            summed += distances[(i + j) as usize];
                        }
                        j += 1;
                    }
                    if summed == best_value {
                        if i == 2 * best_value {
                            best_distance = i;
                        }
                    } else if summed > best_value {
                        best_value = summed;
                        best_distance = i;
                    }
                    i += 1;
                }
            }

            let mut dist_avg: f32 = 0.0;
            let mut nb_dists: f32 = 0.0;

            {
                let mut j = -delta;
                while j <= delta {
                    if best_distance + j >= 0 && best_distance + j < sample_count {
                        let nb_dist = distances[(best_distance + j) as usize];
                        if nb_dist > 0 {
                            nb_dists += nb_dist as f32;
                            dist_avg += ((best_distance + j) * nb_dist) as f32;
                        }
                    }
                    j += 1;
                }
            }

            dist_avg /= nb_dists;

            if cur_mode_distance > -1.0 {
                let similarity = DywaPitchTracker::float_abs(dist_avg * 2.0 - cur_mode_distance);
                if similarity <= 2.0 * delta as f32 {
                    pitch_f = 44100.0
                        / (DywaPitchTracker::power_of_2(cur_level - 1) as f32 * cur_mode_distance);
                    return pitch_f;
                }
            }

            cur_mode_distance = dist_avg;

            cur_level += 1;
            if cur_level >= self.max_flwt_levels {
                return pitch_f;
            }

            if cur_sam_nb < 2 {
                return pitch_f;
            }

            {
                let mut i = 0;
                while i < cur_sam_nb / 2 {
                    sam[i as usize] = (sam[(2 * i) as usize] + sam[(2 * i + 1) as usize]) / 2.0;
                    i += 1;
                }
            }

            cur_sam_nb /= 2;
        }
    }
    fn dynamic_post_processing(&mut self, mut pitch: f32) -> f32 {
        if pitch == 0.0 {
            pitch = -1.0
        }

        let mut estimated_pitch: f32 = -1.0;
        let accepted_error: f32 = 0.2;
        let max_confidence = 5;

        if pitch != -1.0 {
            if self.prev_pitch == -1.0 {
                estimated_pitch = pitch;
                self.prev_pitch = pitch;
                self.pitch_confidence = 1;
            } else if DywaPitchTracker::float_abs(self.prev_pitch - pitch) / pitch < accepted_error
            {
                self.prev_pitch = pitch;
                estimated_pitch = pitch;
                self.pitch_confidence =
                    DywaPitchTracker::int_min(max_confidence, self.pitch_confidence + 1);
            } else if (self.pitch_confidence >= max_confidence - 2)
                && DywaPitchTracker::float_abs(self.prev_pitch - 2.0 * pitch) < accepted_error
            {
                estimated_pitch = 2.0 * pitch;
                self.prev_pitch = estimated_pitch;
            } else if (self.pitch_confidence >= max_confidence - 2)
                && DywaPitchTracker::float_abs(self.prev_pitch - 0.5 * pitch) / (0.5 * pitch)
                    < accepted_error
            {
                estimated_pitch = 0.5 * pitch;
                self.prev_pitch = estimated_pitch;
            } else {
                if self.pitch_confidence >= 1 {
                    estimated_pitch = self.prev_pitch;
                    self.pitch_confidence = DywaPitchTracker::int_max(0, self.pitch_confidence - 1);
                } else {
                    estimated_pitch = pitch;
                    self.prev_pitch = pitch;
                    self.pitch_confidence = 1;
                }
            }
        } else {
            if self.prev_pitch != -1.0 {
                if self.pitch_confidence >= 1 {
                    estimated_pitch = self.prev_pitch;
                    self.pitch_confidence = DywaPitchTracker::int_max(0, self.pitch_confidence - 1);
                } else {
                    self.prev_pitch = -1.0;
                    estimated_pitch = -1.0;
                    self.pitch_confidence = 0;
                }
            }
        }

        if self.pitch_confidence >= 1 {
            pitch = estimated_pitch;
        } else {
            pitch = -1.0;
        }

        if pitch == -1.0 {
            pitch = 0.0;
        }

        return pitch;
    }
}
