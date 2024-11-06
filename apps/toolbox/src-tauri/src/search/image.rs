use image_search::{urls, Arguments};
use serde::Serialize;

use crate::error::AppError;

#[derive(Serialize, specta::Type)]
pub struct ImageSearchResult {
    pub url: String,
}

pub async fn search_image(query: String) -> Result<Vec<ImageSearchResult>, AppError> {
    let args = Arguments::new(&query, 20);

    let res = urls(args)
        .await?;

    let results = res
        .into_iter()
        .map(|url| ImageSearchResult { url })
        .collect();

    Ok(results)
}
