use rusty_ytdl::search::{YouTube, SearchResult};
use serde::Serialize;
use crate::error::AppError;

#[derive(Serialize, specta::Type)]
pub struct YoutubeSearchResult {
  pub title: String,
  pub url: String,
  pub thumbnail: String,
}

pub async fn search_youtube(query: String) -> Result<Vec<YoutubeSearchResult>, AppError> {
  let youtube = YouTube::new()?;

  let res = youtube.search(query, None).await?;

  let results = res.into_iter().filter_map(|item| {
    if let SearchResult::Video(video) = item {
      Some(YoutubeSearchResult {
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnails.get(0)?.url.clone(),
      })
    } else {
      None
    }
  }).collect();

  Ok(results)
}