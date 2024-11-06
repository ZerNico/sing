use crate::{
    convert::lyrics,
    download,
    error::AppError,
    search::{self, youtube::YoutubeSearchResult},
};
use std::path::Path;

#[tauri::command]
#[specta::specta]
pub async fn search_youtube(query: String) -> Result<Vec<YoutubeSearchResult>, AppError> {
    search::youtube::search_youtube(query).await
}

#[tauri::command]
#[specta::specta]
pub async fn search_image(
    query: String,
) -> Result<Vec<search::image::ImageSearchResult>, AppError> {
    search::image::search_image(query).await
}

#[tauri::command]
#[specta::specta]
pub async fn download_song(
    song_name: String,
    output_path: String,
    lyrics: String,
    youtube_url: String,
    cover_url: String,
) -> Result<(), AppError> {
    let output_dir = Path::new(&output_path).join(&song_name);

    if output_dir.exists() {
        return Err(AppError::PathExistsError(
            output_dir.to_string_lossy().to_string(),
        ));
    }

    std::fs::create_dir_all(&output_dir)?;

    let result = async {
        let (youtube_result, image_result) = tokio::join!(
            download::youtube::download_youtube(&youtube_url, &output_dir, &song_name),
            download::image::download_image(&cover_url, &output_dir, &song_name)
        );

        youtube_result?;
        image_result?;

        let lyrics = lyrics::convert_lyrics(&lyrics, &song_name);
        let lyrics_path = output_dir.join(format!("{}.txt", song_name));
        
        let mut content = Vec::new();
        content.extend_from_slice(&[0xEF, 0xBB, 0xBF]);
        content.extend_from_slice(lyrics.as_bytes());
        std::fs::write(&lyrics_path, content)?;
        
        Ok(())
    }.await;

    if let Err(_) = &result {
        let _ = std::fs::remove_dir_all(&output_dir);
    }

    result
}
