use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug, Serialize, specta::Type)]
#[serde(tag = "type", content = "data")]
pub enum AppError {
    #[error("io error: {0}")]
    IoError(String),

    #[error("lofty error: {0}")]
    LoftyError(String),
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::IoError(e.to_string())
    }
}

impl From<lofty::error::LoftyError> for AppError {
    fn from(e: lofty::error::LoftyError) -> Self {
        AppError::LoftyError(e.to_string())
    }
}