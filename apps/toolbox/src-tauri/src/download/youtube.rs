use crate::error::AppError;
use std::path::Path;
use youtube_dl::YoutubeDl;

pub async fn download_youtube(url: &str, path: &Path, song_name: &str) -> Result<(), AppError> {
    YoutubeDl::new(url)
        .format("bestvideo[height<=1080][vcodec^=avc]")
        .output_template(format!("{}.mp4", song_name))
        .download_to_async(path)
        .await?;

    YoutubeDl::new(url)
        .format("bestaudio")
        .extra_arg("--extract-audio")
        .extra_arg("--audio-format")
        .extra_arg("mp3")
        .output_template(format!("{}.mp3", song_name))
        .download_to_async(path)
        .await?;

    Ok(())
}
