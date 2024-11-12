import { openDB } from 'idb';

export async function initDB() {
  return openDB('portfolio-database', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

// Fungsi untuk menambahkan data ke IndexedDB
export async function addProject(data) {
  const db = await initDB();
  const tx = db.transaction('projects', 'readwrite');
  await tx.objectStore('projects').add(data);
  await tx.done;
}

// Fungsi untuk mengambil data dari IndexedDB
export async function getProjects() {
  const db = await initDB();
  return await db.getAll('projects');
}
