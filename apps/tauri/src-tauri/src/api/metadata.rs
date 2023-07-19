use lofty::{Probe, TaggedFileExt};

pub fn get_replaygain(path: String) -> Result<f32, Box<dyn std::error::Error>> {
    let path = path.as_str();

    let tagged_file = Probe::open(path)?.read()?;

    let tag = match tagged_file.primary_tag() {
        Some(primary_tag) => primary_tag,
        None => tagged_file.first_tag().expect("No tags found"),
    };

    let replaygain = tag
        .get_string(&lofty::ItemKey::ReplayGainTrackGain)
        .unwrap_or("0.0");

    // remove dB from string and convert to f32
    let replaygain = replaygain.replace(" dB", "").parse::<f32>()?;

    return Ok(replaygain);
}
