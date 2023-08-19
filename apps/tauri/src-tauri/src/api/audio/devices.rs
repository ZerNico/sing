use cpal::traits::{DeviceTrait, HostTrait};
use rspc::Type;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Type)]
pub struct Microphone {
    name: String,
    channels: u16,
    sample_rates: Vec<u32>,
}

#[tauri::command]
pub fn get_microphones() -> Vec<Microphone> {
    let mut microphones = Vec::new();

    let host = cpal::default_host();
    let devices = host.devices().unwrap();

    for (_, device) in devices.enumerate() {
        let input_configs = match device.supported_input_configs() {
            Ok(f) => f.collect(),
            Err(e) => {
                println!("Error getting supported input configs: {:?}", e);
                Vec::new()
            }
        };

        if !input_configs.is_empty() {
            let mut sample_rates = Vec::new();

            for config in &input_configs {
                sample_rates.push(config.min_sample_rate().0);
            }

            microphones.push(Microphone {
                name: device.name().unwrap(),
                channels: input_configs[0].channels(),
                sample_rates,
            });
        }
    }

    microphones
}
