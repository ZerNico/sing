use std::sync::Arc;
mod metadata;
use rspc::{Error, ErrorCode, Router};

use self::metadata::get_replaygain;

pub(crate) struct Context;

pub(crate) fn router() -> Arc<Router<Context>> {
    let router = Router::<Context>::new()
        .query("replaygain", |t| {
            t(|_, path: String| async move {
                let response = get_replaygain(path);

                if response.is_ok() {
                    return Ok(response.unwrap());
                }

                Err(Error::new(
                    ErrorCode::BadRequest,
                    "could_not_get_replaygain".into(),
                ))
            })
        })
        .build();

    router.export_ts("../src/rspc-bindings.ts").unwrap();

    Arc::new(router)
}
