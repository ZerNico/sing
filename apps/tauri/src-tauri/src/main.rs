// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
mod protocol;

fn main() {
    let rt = tokio::runtime::Runtime::new().unwrap();
    let _guard = rt.enter();

    tauri::Builder::default()
        .plugin(rspc::integrations::tauri::plugin(api::router(), || {
            api::Context
        }))
        .plugin(tauri_plugin_persisted_scope::init())
        .register_uri_scheme_protocol("stream", protocol::stream_protocol_handler)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
