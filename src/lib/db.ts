import { openDB, IDBPDatabase } from 'idb';
import type { Track } from '../types/audio';

const DB_NAME = 'precision-audio-db';
const STORE_NAME = 'local-tracks';
const VERSION = 1;

interface LocalTrack {
  id: string;
  blob: Blob;
  metadata: Omit<Track, 'src'>;
}

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveLocalTrack(track: Track, file: File) {
  const db = await getDB();
  const localTrack: LocalTrack = {
    id: track.id,
    blob: file,
    // Bug 10 fix: explicit field assignment instead of { ...track, src: '' }.
    // The spread pattern included src (a blob URL) before overriding it,
    // which was fragile and stored unintended data.
    metadata: {
      id: track.id,
      title: track.title,
      artist: track.artist,
      albumArt: track.albumArt,
      duration: track.duration,
      source: track.source,
    },
  };
  await db.put(STORE_NAME, localTrack);
}

export async function getAllLocalTracks(): Promise<Track[]> {
  const db = await getDB();
  const localTracks: LocalTrack[] = await db.getAll(STORE_NAME);

  return localTracks.map(lt => ({
    ...lt.metadata,
    src: URL.createObjectURL(lt.blob),
  }));
}

export async function removeLocalTrack(id: string) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
