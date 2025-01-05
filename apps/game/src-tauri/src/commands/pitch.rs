use tauri::State;

use crate::{
    audio::recorder::{MicrophoneOptions, Recorder},
    error::AppError,
    AppState,
};

#[tauri::command]
#[specta::specta]
pub fn start_recording(
    state: State<'_, AppState>,
    options: Vec<MicrophoneOptions>,
    samples_per_beat: i32,
) -> Result<(), AppError> {
    let mut recorder = state.recorder.write().unwrap();

    if recorder.is_some() {
        return Err(AppError::RecorderError("recorder already started".to_string()));
    }

    *recorder = Some(Recorder::new(options, samples_per_beat as usize)?);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn stop_recording(state: State<'_, AppState>) -> Result<(), AppError> {
    let mut recorder = state.recorder.write().unwrap();

    if recorder.is_none() {
        return Err(AppError::RecorderError("recorder not started".to_string()));
    }

    recorder.take();
    Ok(())
}


#[tauri::command]
#[specta::specta]
pub fn get_pitch(state: State<'_, AppState>, index: i32) -> Result<f32, AppError> {
    let recorder = state.recorder.read().unwrap();

    if let Some(recorder) = &*recorder {
        Ok(recorder.get_pitch(index as usize))
    } else {
        Err(AppError::RecorderError("recorder not started".to_string()))
    }
}