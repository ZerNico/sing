
// This file was generated by [tauri-specta](https://github.com/oscartbeaumont/tauri-specta). Do not edit this file manually.

/** user-defined commands **/


export const commands = {
async getReplayGain(path: string) : Promise<Result<ReplayGainInfo, AppError>> {
    try {
    return { status: "ok", data: await TAURI_INVOKE("get_replay_gain", { path }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async getMicrophones() : Promise<Result<Microphone[], AppError>> {
    try {
    return { status: "ok", data: await TAURI_INVOKE("get_microphones") };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async startRecording(options: MicrophoneOptions[], samplesPerBeat: number) : Promise<Result<null, AppError>> {
    try {
    return { status: "ok", data: await TAURI_INVOKE("start_recording", { options, samplesPerBeat }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async stopRecording() : Promise<Result<null, AppError>> {
    try {
    return { status: "ok", data: await TAURI_INVOKE("stop_recording") };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
},
async getPitch(index: number) : Promise<Result<number, AppError>> {
    try {
    return { status: "ok", data: await TAURI_INVOKE("get_pitch", { index }) };
} catch (e) {
    if(e instanceof Error) throw e;
    else return { status: "error", error: e  as any };
}
}
}

/** user-defined events **/



/** user-defined constants **/



/** user-defined types **/

export type AppError = { type: "IoError"; data: string } | { type: "LoftyError"; data: string } | { type: "RecorderError"; data: string } | { type: "ProcessorError"; data: string } | { type: "CpalError"; data: string }
export type Microphone = { name: string; channels: number }
export type MicrophoneOptions = { name: string; channel: number; gain: number; threshold: number }
export type ReplayGainInfo = { track_gain: number | null; track_peak: number | null; album_gain: number | null; album_peak: number | null }

/** tauri-specta globals **/

import {
	invoke as TAURI_INVOKE,
	Channel as TAURI_CHANNEL,
} from "@tauri-apps/api/core";
import * as TAURI_API_EVENT from "@tauri-apps/api/event";
import { type WebviewWindow as __WebviewWindow__ } from "@tauri-apps/api/webviewWindow";

type __EventObj__<T> = {
	listen: (
		cb: TAURI_API_EVENT.EventCallback<T>,
	) => ReturnType<typeof TAURI_API_EVENT.listen<T>>;
	once: (
		cb: TAURI_API_EVENT.EventCallback<T>,
	) => ReturnType<typeof TAURI_API_EVENT.once<T>>;
	emit: null extends T
		? (payload?: T) => ReturnType<typeof TAURI_API_EVENT.emit>
		: (payload: T) => ReturnType<typeof TAURI_API_EVENT.emit>;
};

export type Result<T, E> =
	| { status: "ok"; data: T }
	| { status: "error"; error: E };

function __makeEvents__<T extends Record<string, any>>(
	mappings: Record<keyof T, string>,
) {
	return new Proxy(
		{} as unknown as {
			[K in keyof T]: __EventObj__<T[K]> & {
				(handle: __WebviewWindow__): __EventObj__<T[K]>;
			};
		},
		{
			get: (_, event) => {
				const name = mappings[event as keyof T];

				return new Proxy((() => {}) as any, {
					apply: (_, __, [window]: [__WebviewWindow__]) => ({
						listen: (arg: any) => window.listen(name, arg),
						once: (arg: any) => window.once(name, arg),
						emit: (arg: any) => window.emit(name, arg),
					}),
					get: (_, command: keyof __EventObj__<any>) => {
						switch (command) {
							case "listen":
								return (arg: any) => TAURI_API_EVENT.listen(name, arg);
							case "once":
								return (arg: any) => TAURI_API_EVENT.once(name, arg);
							case "emit":
								return (arg: any) => TAURI_API_EVENT.emit(name, arg);
						}
					},
				});
			},
		},
	);
}
