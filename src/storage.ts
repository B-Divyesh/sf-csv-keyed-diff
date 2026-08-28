import type { CsvData, DiffResult } from './csv';

export interface StoredSession {
  before?: CsvData;
  after?: CsvData;
  keys: string[];
  result?: DiffResult;
  updatedAt: number;
}

const DB = 'csv-keyed-diff';
const STORE = 'sessions';

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSession(session: StoredSession) {
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(session, 'current');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function loadSession(): Promise<StoredSession | undefined> {
  const db = await database();
  const value = await new Promise<StoredSession | undefined>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get('current');
    request.onsuccess = () => resolve(request.result as StoredSession | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value;
}

export async function clearSession() {
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).delete('current');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}
