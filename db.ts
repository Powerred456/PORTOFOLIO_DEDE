// db.ts
export const openDB = (dbName: string, version: number = 1) => {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(dbName, version);

        request.onerror = (event) => {
            console.error("Database error:", request.error);
            reject(request.error);
        };

        request.onsuccess = (event) => {
            const db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = request.result;

            // Membuat object store
            if (!db.objectStoreNames.contains("invoices")) {
                db.createObjectStore("invoices", { keyPath: "id", autoIncrement: true });
            }
        };
    });
};

export const addData = async (dbName: string, storeName: string, data: any) => {
    const db = await openDB(dbName);
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    const request = store.add(data);
    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const getAllData = async (dbName: string, storeName: string) => {
    const db = await openDB(dbName);
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);

    const request = store.getAll();
    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};
