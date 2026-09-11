import { recordSchema, type HistoryRecord } from './history.ts';

// Per-site database name also isolates different project sites on the same github.io origin.
const dbName = 'carnet-histoire:' + new URL('.', location.href).pathname;
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('records', { keyPath: 'id' });
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Fermez les autres onglets du carnet puis réessayez.'));
    request.onsuccess = () => resolve(request.result);
  });
}
export async function readRecords(): Promise<HistoryRecord[]> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('records', 'readonly');
      const request = tx.objectStore('records').getAll();
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () => reject(tx.error);
      tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
}
async function write(operation: (store: IDBObjectStore) => void) {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('records', 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error || new Error('Sauvegarde annulée.'));
      tx.onerror = () => reject(tx.error);
      try { operation(tx.objectStore('records')); } catch (error) { tx.abort(); reject(error); }
    });
  } finally { db.close(); }
}
export async function saveRecord(record: HistoryRecord) {
  const validated = recordSchema.parse(record);
  await write(store => { store.put(validated); });
}
export async function deleteRecord(id: string) { await write(store => { store.delete(id); }); }
export async function importRecords(records: HistoryRecord[]) {
  // Validate the entire backup before starting the atomic transaction.
  const validated = records.map(record => recordSchema.parse(record));
  await write(store => { for (const record of validated) store.put(record); });
}
export async function readPhoto(file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024 || !['image/jpeg','image/png','image/webp'].includes(file.type)) {
    throw new Error('Choisissez une image JPG, PNG ou WebP de moins de 5 Mo.');
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture de la photo impossible.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}
export function storageError(error: unknown): string {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    return 'Le stockage est plein. Exportez votre carnet puis libérez de la place. Votre saisie est conservée.';
  }
  return error instanceof Error ? error.message : 'Stockage local indisponible. Votre saisie est conservée.';
}


export async function replaceRecords(records: HistoryRecord[]) {
  const valid=records.map(record=>recordSchema.parse(record));
  await write(store=>{store.clear();for(const record of valid)store.put(record);});
}
