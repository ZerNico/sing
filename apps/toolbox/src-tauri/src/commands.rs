use crate::search::{self, youtube::YoutubeSearchResult};
use crate::error::AppError;

#[tauri::command]
#[specta::specta]
pub async fn search_youtube(query: String) -> Result<Vec<YoutubeSearchResult>, AppError> {
  search::youtube::search_youtube(query).await
}

#[tauri::command]
#[specta::specta]
pub async fn search_image(query: String) -> Result<Vec<search::image::ImageSearchResult>, AppError> {
  search::image::search_image(query).await
}