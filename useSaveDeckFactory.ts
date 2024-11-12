import useAuthUser from "./hooks/useAuthUser";
import { usePostUserDeck } from "./hooks/wunderworldsAPIHooks";
import offlineDB from "./database/offlineDB"; // Jika offlineDB berada di folder `database`

// Interface untuk Payload (agar lebih aman dengan TypeScript)
interface Payload {
    data: {
        [key: string]: any; // Anda bisa mengubah any ke tipe yang lebih spesifik
    };
}

// Fungsi Factory untuk menyimpan deck
export function useSaveDeckFactory() {
    // Mengambil informasi user
    const user = useAuthUser();

    // Mengambil fungsi API untuk menyimpan deck user
    const [, saveUserDeck] = usePostUserDeck();

    // Jika user terautentikasi, gunakan API untuk menyimpan deck
    if (user !== null) {
        return saveUserDeck;
    } 

    // Jika user tidak terautentikasi, simpan secara lokal
    return function saveLocally(payload: Payload) {
        try {
            const now = new Date().getTime();

            // Cek validitas payload.data
            if (!payload || !payload.data) {
                throw new Error("Payload atau data tidak valid.");
            }

            // Menyimpan deck ke IndexedDB menggunakan offlineDB
            return offlineDB.anonDecks.add({
                ...payload.data,
                createdutc: now,
                updatedutc: now,
            }).then((id: number) => {
                console.log(`Deck berhasil disimpan secara lokal dengan ID: ${id}`);
                return id;
            }).catch((error: any) => {
                console.error("Gagal menyimpan deck secara lokal:", error);
                throw error;
            });
        } catch (error: any) {
            console.error("Terjadi kesalahan saat menyimpan deck:", error);
            throw error;
        }
    };
}
