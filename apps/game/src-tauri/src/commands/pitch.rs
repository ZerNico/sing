use std::sync::Mutex;

use tauri::State;

use crate::{
    audio::recorder::{MicrophoneOptions, Recorder},
    error::AppError,
    AppState,
};

#[tauri::command]
#[specta::specta]
pub fn start_recording(
    state: State<'_, Mutex<AppState>>,
    options: Vec<MicrophoneOptions>,
) -> Result<(), AppError> {
    let mut state = state.lock().unwrap();
    if state.recorder.is_some() {
        return Err(AppError::RecorderError(
            "Recorder already running".to_string(),
        ));
    }

    let recorder = Recorder::new(options)?;
    state.recorder.replace(recorder);

    return Ok(());
}

#[tauri::command]
#[specta::specta]
pub fn stop_recording(state: State<'_, Mutex<AppState>>) -> Result<(), AppError> {
    let mut state = state.lock().unwrap();
    if state.recorder.is_none() {
        return Err(AppError::RecorderError(
            "Recorder not running".to_string(),
        ));
    }

    state.recorder.take();
    return Ok(());
}