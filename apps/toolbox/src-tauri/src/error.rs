use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug, Serialize, specta::Type)]
#[serde(tag = "type", content = "data")]
pub enum AppError {
  #[error("Initialization failed")]
  InitializationError,
  #[error("Search failed: {0}")]
  SearchError(String),
}
