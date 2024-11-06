use chardetng::EncodingDetector;
use encoding_rs::*;

pub fn convert_lyrics(lyrics: &str, song_name: &str) -> String {
    let mut detector = EncodingDetector::new();
    detector.feed(lyrics.as_bytes(), true);
    let encoding = detector.guess(None, true);
    
    // Convert to UTF-8 if necessary
    let utf8_lyrics = if encoding != UTF_8 {
        let (cow, _encoding_used, _had_errors) = encoding.decode(lyrics.as_bytes());
        cow.into_owned()
    } else {
        lyrics.to_string()
    };

    let line_ending = if utf8_lyrics.contains("\r\n") {
        "\r\n"
    } else {
        "\n"
    };

    let header_prefixes = ["#COVER", "#MP3", "#VIDEO", "#BACKGROUND"];
    
    let lines: Vec<&str> = utf8_lyrics
        .lines()
        .filter(|line| !header_prefixes.iter().any(|prefix| line.starts_with(prefix)))
        .collect();

    let headers = vec![
        format!("#COVER:{}.jpg", song_name),
        format!("#MP3:{}.mp3", song_name),
        format!("#VIDEO:{}.mp4", song_name),
    ]
    .join(line_ending);

    format!("{}{}{}", headers, line_ending, lines.join(line_ending))
}
