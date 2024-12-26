import { Md5 } from "ts-md5";
import type { Note, NoteType } from "../note";
import type { Phrase } from "../phrase";
import type { Song } from "../song";
import type { Voice } from "../voice";
import { ParseError } from "./error";

export function parseUltrastarTxt(content: string) {
  const partialSong: Partial<Song> = {
    relative: false,
  };
  let notes: Note[] = [];
  let phrases: Phrase[] = [];
  const voices: Voice[] = [];

  const md5 = new Md5();

  const lines = content.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    try {
      if (line.trim() === "") continue;

      if (line.startsWith("#")) {
        const [property, v] = line.slice(1).trim().split(":");
        if (!property || !v) continue;

        const value = v.trim();

        switch (property.toLocaleLowerCase()) {
          case "title": {
            partialSong.title = value;
            break;
          }
          case "artist": {
            partialSong.artist = value;
            break;
          }
          case "language": {
            partialSong.language = value;
            break;
          }
          case "edition": {
            partialSong.edition = value;
            break;
          }
          case "genre": {
            partialSong.genre = value;
            break;
          }
          case "year": {
            partialSong.year = parseUSInt(value);
            break;
          }
          case "bpm": {
            partialSong.bpm = parseUSInt(value);
            break;
          }
          case "gap": {
            partialSong.gap = parseUSInt(value);
            break;
          }
          case "mp3": {
            partialSong.audio = value;
            break;
          }
          case "audio": {
            partialSong.audio = value;
            break;
          }
          case "cover": {
            partialSong.cover = value;
            break;
          }
          case "video": {
            partialSong.video = value;
            break;
          }
          case "background": {
            partialSong.background = value;
            break;
          }
          case "relative": {
            partialSong.relative = parseUsBool(value);
            break;
          }
          case "videogap": {
            partialSong.videoGap = parseUSFloat(value);
            break;
          }
          case "author": {
            partialSong.author = value;
            break;
          }
        }
      } else if ([":", "*", "F", "R", "G"].includes(line.charAt(0))) {
        const [tag, startBeat, length, txtPitch, ...text] = line.slice(0, Math.max(0, line.length)).split(" ");
        if (!tag || !startBeat || !length || !txtPitch || !text) {
          throw new ParseError("Invalid line");
        }
        const note: Note = {
          type: tagToNoteType(tag),
          startBeat: parseUSInt(startBeat),
          length: parseUSInt(length),
          txtPitch: parseUSInt(txtPitch),
          midiNote: parseUSInt(txtPitch) + 60,
          text: text.join(" "),
        };
        notes.push(note);
        md5.appendStr(line);
      } else if (line.charAt(0) === "-") {
        const [, disappearBeat]: string[] = line.slice(1).split(" ");
        if (!disappearBeat) {
          throw new ParseError("Invalid linebreak");
        }
        const phrase: Phrase = {
          disappearBeat: parseUSInt(disappearBeat),
          notes: notes,
        };
        phrases.push(phrase);
        notes = [];
        md5.appendStr(line);
      } else if (line.charAt(0) === "P") {
        if (phrases.length === 0) continue;
        const lastNote = notes.at(-1);
        if (lastNote) {
          const phrase: Phrase = {
            disappearBeat: lastNote.startBeat + lastNote.length + 1,
            notes: notes,
          };
          phrases.push(phrase);
        }
        const voice: Voice = {
          phrases: phrases,
        };
        voices.push(voice);
        notes = [];
        phrases = [];
      } else if (line.charAt(0) === "E") {
        const lastNote = notes.at(-1);
        if (lastNote) {
          const phrase: Phrase = {
            disappearBeat: lastNote.startBeat + lastNote.length + 1,
            notes: notes,
          };
          phrases.push(phrase);
        }
        const voice: Voice = {
          phrases: phrases,
        };
        voices.push(voice);
        partialSong.hash = md5.end()?.toString();
        partialSong.voices = voices;
      }
    } catch (error) {
      if (error instanceof ParseError) {
        throw new ParseError(`Failed to parse line ${index + 1}: ${error.message}`);
      }
    }
  }

  if (!isValidSong(partialSong)) {
    throw new ParseError("Invalid song");
  }

  return partialSong;
}

const parseUSInt = (value: string) => {
  const int = Number.parseInt(value);
  if (Number.isNaN(int)) throw new ParseError("Invalid integer");
  return int;
};

const parseUSFloat = (value: string) => {
  const float = Number.parseFloat(value.replace(",", "."));
  if (Number.isNaN(float)) throw new ParseError("Invalid float");
  return float;
};

const parseUsBool = (value: string) => {
  if (value === "yes" || value === "true") return true;
  if (value === "no" || value === "false") return false;
  throw new ParseError("Invalid boolean");
};

function tagToNoteType(tag: string): NoteType {
  switch (tag.toUpperCase()) {
    case ":": {
      return "Normal";
    }
    case "*": {
      return "Golden";
    }
    case "F": {
      return "Freestyle";
    }
    // Use Rap notes as Freestyle notes for now
    case "R": {
      return "Freestyle";
    }
    case "G": {
      return "Freestyle";
    }
  }
  return "Normal";
}

function isValidSong(song: Partial<Song>): song is Song {
  return !!song.title && !!song.artist && !!song.bpm && !!song.gap && !!song.hash && (!!song.audio || !!song.video);
}
