use lofty::{Probe, TaggedFileExt};

pub fn get_replaygain(path: String) -> Result<f32, Box<dyn std::error::Error>> {
    let path = path.as_str();
    let path = path.strip_prefix("stream://localhost/").unwrap_or("");
    let path = percent_encoding::percent_decode(path.as_bytes())
        .decode_utf8_lossy()
        .to_string();

    let tagged_file = Probe::open(path)?.read()?;

    let tag = match tagged_file.primary_tag() {
        Some(primary_tag) => primary_tag,
        None => return Ok(0.0), // Return 0.0 when no tags are found
    };

    let replaygain = tag
        .get_string(&lofty::ItemKey::ReplayGainTrackGain)
        .unwrap_or("0.0");

    // Remove dB from string and convert to f32
    let replaygain = replaygain.replace(" dB", "").parse::<f32>()?;

    Ok(replaygain)
}
