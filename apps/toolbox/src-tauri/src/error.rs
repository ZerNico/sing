use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug, Serialize, specta::Type)]
#[serde(tag = "type", content = "data")]
pub enum AppError {
    #[error("io error: {0}")]
    IoError(String),

    #[error("path exists: {0}")]
    PathExistsError(String),

    #[error("request error: {0}")]
    RequestError(String),

    #[error("youtube-dl error: {0}")]
    YoutubeDlError(String),

    #[error("image search error: {0}")]
    ImageSearchError(String),

    #[error("youtube download error: {0}")]
    YoutubeSearchError(String),
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::IoError(e.to_string())
    }
}

impl From<reqwest::Error> for AppError {
    fn from(e: reqwest::Error) -> Self {
        AppError::RequestError(e.to_string())
    }
}

impl From<youtube_dl::Error> for AppError {
    fn from(e: youtube_dl::Error) -> Self {
        AppError::YoutubeDlError(e.to_string())
    }
}

impl From<image_search::Error> for AppError {
    fn from(e: image_search::Error) -> Self {
        AppError::ImageSearchError(e.to_string())
    }
}

impl From<rusty_ytdl::VideoError> for AppError {
    fn from(e: rusty_ytdl::VideoError) -> Self {
        AppError::YoutubeSearchError(e.to_string())
    }
}