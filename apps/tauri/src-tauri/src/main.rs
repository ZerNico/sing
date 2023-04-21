// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use audio::recorder::{Recorder, MicrophoneOptions};
use cpal::traits::{HostTrait, DeviceTrait};  
mod audio;
mod metadata;
mod protocol;

struct AppState {
    recorder: Recorder,
}

#[tauri::command]
fn start_recording(state: tauri::State<'_, AppState>, microphones: Vec<MicrophoneOptions>, samples_per_beat: i32) -> Result<(), ()> {
    println!("Starting recording...");
    state.recorder.start_recording(microphones, samples_per_beat);
    Ok(())
}

#[tauri::command]
async fn stop_recording(state: tauri::State<'_, AppState>) -> Result<(), ()> {
    println!("Stopping recording...");
    state.recorder.stop_recording();
    Ok(())
}

#[tauri::command]
async fn get_pitch(state: tauri::State<'_, AppState>, microphone: usize) -> Result<f32, ()> {
    Ok(state.recorder.get_pitch(microphone))
}

#[derive(serde::Serialize, serde::Deserialize)]
struct Device {
    name: String,
    channels: u16,
}

#[tauri::command]
fn get_devices() -> Vec<Device> {
    let mut dev = Vec::new();

    let host = cpal::default_host();
    let devices = host.devices().unwrap();
    for (_, device) in devices.enumerate() {
        if let Ok(config) = device.default_input_config() {
            let microphone = Device {
                name: device.name().unwrap(),
                channels: config.channels(),
            };
            dev.push(microphone);
        }
    }
    dev
}

#[tauri::command]
async fn get_replaygain(_state: tauri::State<'_, AppState>, path: String) -> Result<f32, ()> {
    let replaygain = metadata::replaygain::get_replaygain(path);
    Ok(replaygain.unwrap_or(0.0))
}

fn main() {
    let state = AppState {
        recorder: Recorder::new(),
    };

    tauri::Builder::default()
        .manage(state)
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_persisted_scope::init())
        .invoke_handler(tauri::generate_handler![start_recording, stop_recording, get_pitch, get_devices, get_replaygain])
        .register_uri_scheme_protocol("stream", protocol::stream_protocol_handler)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
