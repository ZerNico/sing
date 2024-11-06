use std::path::Path;
use reqwest;
use crate::error::AppError;

pub async fn download_image(url: &str, path: &Path, filename: &str) -> Result<(), AppError> {
    let response = reqwest::get(url).await?;
    let bytes = response.bytes().await?;
    
    let image_path = path.join(format!("{}.jpg", filename));
    std::fs::write(&image_path, bytes)?;
    
    Ok(())
}
