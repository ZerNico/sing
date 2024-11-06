use crate::error::AppError;
use std::path::Path;
use youtube_dl::YoutubeDl;

pub async fn download_youtube(url: &str, path: &Path, song_name: &str) -> Result<(), AppError> {
    YoutubeDl::new(url)
        .format("bestvideo[height<=1080][vcodec^=avc]")
        .extra_arg("-o")
        .extra_arg(&format!("{}/%(title)s.%(ext)s", path.to_string_lossy()))
        .run_async()
        .await?;

    YoutubeDl::new(url)
        .format("bestaudio")
        .extra_arg("--extract-audio")
        .extra_arg("--audio-format")
        .extra_arg("mp3")
        .extra_arg("-o")
        .extra_arg(&format!("{}/%(title)s.%(ext)s", path.to_string_lossy()))
        .run_async()
        .await?;

    Ok(())
}
