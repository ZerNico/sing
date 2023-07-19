use rand::RngCore;
use std::io::SeekFrom;
use tauri::http::HttpRange;
use tauri::http::{header::*, status::StatusCode, MimeType, Request, Response, ResponseBuilder};
use tauri::AppHandle;
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncSeekExt, AsyncWriteExt};
use url::Position;
use url::Url;

pub fn stream_protocol_handler(
    _app: &AppHandle,
    request: &Request,
) -> Result<Response, Box<dyn std::error::Error>> {
    let parsed_path = Url::parse(request.uri())?;
    let filtered_path = &parsed_path[..Position::AfterPath];
    let path = filtered_path
        .strip_prefix("stream://localhost/")
        // the `strip_prefix` only returns None when a request is made to `https://tauri.$P` on Windows
        // where `$P` is not `localhost/*`
        .unwrap_or("");

    let path = percent_encoding::percent_decode(path.as_bytes())
        .decode_utf8_lossy()
        .to_string();

    let mut resp = ResponseBuilder::new().header("Access-Control-Allow-Origin", "*");

    tauri::async_runtime::block_on(async move {
        let mut file = File::open(&path).await?;

        // get file length
        let len = {
            let old_pos = file.stream_position().await?;
            let len = file.seek(SeekFrom::End(0)).await?;
            file.seek(SeekFrom::Start(old_pos)).await?;
            len
        };

        // get file mime type
        let (mime_type, read_bytes) = {
            let nbytes = len.min(8192);
            let mut magic_buf = Vec::with_capacity(nbytes as usize);
            let old_pos = file.stream_position().await?;
            (&mut file).take(nbytes).read_to_end(&mut magic_buf).await?;
            file.seek(SeekFrom::Start(old_pos)).await?;
            (
                MimeType::parse(&magic_buf, &path),
                // return the `magic_bytes` if we read the whole file
                // to avoid reading it again later if this is not a range request
                if len < 8192 { Some(magic_buf) } else { None },
            )
        };

        resp = resp.header(CONTENT_TYPE, &mime_type);

        // handle 206 (partial range) http requests
        let response = if let Some(range_header) = request
            .headers()
            .get("range")
            .and_then(|r| r.to_str().map(|r| r.to_string()).ok())
        {
            resp = resp.header(ACCEPT_RANGES, "bytes");

            let not_satisfiable = || {
                ResponseBuilder::new()
                    .status(StatusCode::RANGE_NOT_SATISFIABLE)
                    .header(CONTENT_RANGE, format!("bytes */{len}"))
                    .body(vec![])
            };

            // parse range header
            let ranges = if let Ok(ranges) = HttpRange::parse(&range_header, len) {
                ranges
                    .iter()
                    // map the output to spec range <start-end>, example: 0-499
                    .map(|r| (r.start, r.start + r.length - 1))
                    .collect::<Vec<_>>()
            } else {
                return not_satisfiable();
            };

            /// The Maximum bytes we send in one range
            const MAX_LEN: u64 = 1000 * 1024;

            // single-part range header
            if ranges.len() == 1 {
                let &(start, mut end) = ranges.first().unwrap();

                // check if a range is not satisfiable
                //
                // this should be already taken care of by the range parsing library
                // but checking here again for extra assurance
                if start >= len || end >= len || end < start {
                    return not_satisfiable();
                }

                // adjust end byte for MAX_LEN
                end = start + (end - start).min(len - start).min(MAX_LEN - 1);

                // calculate number of bytes needed to be read
                let nbytes = end + 1 - start;

                let mut buf = Vec::with_capacity(nbytes as usize);
                file.seek(SeekFrom::Start(start)).await?;
                file.take(nbytes).read_to_end(&mut buf).await?;

                resp = resp.header(CONTENT_RANGE, format!("bytes {start}-{end}/{len}"));
                resp = resp.header(CONTENT_LENGTH, end + 1 - start);
                resp = resp.status(StatusCode::PARTIAL_CONTENT);
                resp.body(buf)
            } else {
                // multi-part range header
                let mut buf = Vec::new();
                let ranges = ranges
                    .iter()
                    .filter_map(|&(start, mut end)| {
                        // filter out unsatisfiable ranges
                        //
                        // this should be already taken care of by the range parsing library
                        // but checking here again for extra assurance
                        if start >= len || end >= len || end < start {
                            None
                        } else {
                            // adjust end byte for MAX_LEN
                            end = start + (end - start).min(len - start).min(MAX_LEN - 1);
                            Some((start, end))
                        }
                    })
                    .collect::<Vec<_>>();

                let boundary = random_boundary();
                let boundary_sep = format!("\r\n--{boundary}\r\n");
                let boundary_closer = format!("\r\n--{boundary}\r\n");

                resp = resp.header(
                    CONTENT_TYPE,
                    format!("multipart/byteranges; boundary={boundary}"),
                );

                for (end, start) in ranges {
                    // a new range is being written, write the range boundary
                    buf.write_all(boundary_sep.as_bytes()).await?;

                    // write the needed headers `Content-Type` and `Content-Range`
                    buf.write_all(format!("{CONTENT_TYPE}: {mime_type}\r\n").as_bytes())
                        .await?;
                    buf.write_all(
                        format!("{CONTENT_RANGE}: bytes {start}-{end}/{len}\r\n").as_bytes(),
                    )
                    .await?;

                    // write the separator to indicate the start of the range body
                    buf.write_all("\r\n".as_bytes()).await?;

                    // calculate number of bytes needed to be read
                    let nbytes = end + 1 - start;

                    let mut local_buf = Vec::with_capacity(nbytes as usize);
                    file.seek(SeekFrom::Start(start)).await?;
                    (&mut file).take(nbytes).read_to_end(&mut local_buf).await?;
                    buf.extend_from_slice(&local_buf);
                }
                // all ranges have been written, write the closing boundary
                buf.write_all(boundary_closer.as_bytes()).await?;

                resp.body(buf)
            }
        } else {
            // avoid reading the file if we already read it
            // as part of mime type detection
            let buf = if let Some(b) = read_bytes {
                b
            } else {
                let mut local_buf = Vec::with_capacity(len as usize);
                file.read_to_end(&mut local_buf).await?;
                local_buf
            };
            resp = resp.header(CONTENT_LENGTH, len);
            resp.body(buf)
        };

        response
    })
}

fn random_boundary() -> String {
    let mut x = [0_u8; 30];
    rand::thread_rng().fill_bytes(&mut x);
    (x[..])
        .iter()
        .map(|&x| format!("{x:x}"))
        .fold(String::new(), |mut a, x| {
            a.push_str(x.as_str());
            a
        })
}
