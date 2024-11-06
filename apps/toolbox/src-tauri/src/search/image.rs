use serde::{Deserialize, Serialize};
use crate::error::AppError;

#[derive(Serialize, specta::Type)]
pub struct ImageSearchResult {
    pub url: String,
}

#[derive(Deserialize)]
struct ITunesResponse {
    results: Vec<ITunesResult>,
}

#[derive(Deserialize)]
struct ITunesResult {
    artworkUrl100: String,
}

pub async fn search_image(query: String) -> Result<Vec<ImageSearchResult>, AppError> {
    let client = reqwest::Client::new();
    let url = format!(
        "https://itunes.apple.com/search?term={}&entity=album,song&limit=20",
        urlencoding::encode(&query)
    );

    let response = client
        .get(&url)
        .send()
        .await?
        .json::<ITunesResponse>()
        .await?;

    let results = response
        .results
        .into_iter()
        .map(|result| {
            // Convert 100x100 to larger 600x600 artwork
            let url = result.artworkUrl100.replace("100x100", "600x600");
            ImageSearchResult { url }
        })
        .collect();

    Ok(results)
}
