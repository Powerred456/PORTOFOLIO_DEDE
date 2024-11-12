document.addEventListener('DOMContentLoaded', () => {
  // Mendaftar Service Worker untuk PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  }

  // Minta izin untuk Push Notification
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    });
  }

  // Mengatur IndexedDB untuk proyek portofolio
  const dbName = 'portfolio-database';
  const storeName = 'projects';
  let db;

  function openDB() {
    const dbPromise = idb.openDB(dbName, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        }
      }
    });

    dbPromise.then(database => {
      db = database;
      console.log('Database opened successfully');
      loadData(); // Memuat data setelah DB dibuka
    }).catch(err => {
      console.log('Failed to open IndexedDB:', err);
    });
  }

  // Menyimpan data proyek ke IndexedDB
  function saveData(project) {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.add(project);
    tx.done.then(() => {
      console.log('Project saved to IndexedDB');
    }).catch(err => {
      console.log('Error saving project:', err);
    });
  }

  // Memuat data proyek dari IndexedDB
  function loadData() {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    store.getAll().then((projects) => {
      if (projects.length === 0) {
        console.log('No projects found, loading default.');
        displayProjects(); // Menampilkan proyek default jika tidak ada di DB
      } else {
        console.log('Projects loaded from IndexedDB:', projects);
        displayProjects(projects); // Menampilkan proyek dari IndexedDB
      }
    }).catch(err => {
      console.log('Error loading projects:', err);
      displayProjects(); // Menampilkan proyek default jika terjadi error
    });
  }

  // Data proyek default
  const defaultProjects = [
    { title: 'Project 1', description: 'Deskripsi project 1', link: '#' },
    { title: 'Project 2', description: 'Deskripsi project 2', link: '#' },
    { title: 'Project 3', description: 'Deskripsi project 3', link: '#' },
  ];

  // Menampilkan proyek di halaman
  function displayProjects(projects = defaultProjects) {
    const projectContainer = document.getElementById('project-container');
    projectContainer.innerHTML = ''; // Membersihkan kontainer sebelum menampilkan

    projects.forEach((project) => {
      const projectElement = document.createElement('div');
      projectElement.classList.add('project-card');
      projectElement.innerHTML = `
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <a href="${project.link}" target="_blank">Lihat Project</a>
      `;
      projectContainer.appendChild(projectElement);
    });
  }

  // Menyimpan proyek default ke IndexedDB jika belum ada
  function saveDefaultProjects() {
    defaultProjects.forEach(project => saveData(project));
  }

  openDB();  // Membuka IndexedDB
  saveDefaultProjects();  // Menyimpan proyek default ke DB

  // Public VAPID Key Anda (Ganti dengan yang Anda miliki)
  const publicVapidKey = 'YOUR_PUBLIC_VAPID_KEY_HERE';

  // Mendaftarkan Push Subscription (menangani push notification)
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      // Subscribe ke PushManager
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey) // Ganti dengan kunci publik Anda
      }).then(subscription => {
        console.log('User subscribed to push notifications:', subscription);
        // Kirimkan subscription ini ke server Anda untuk disimpan
        // Bisa menggunakan fetch API untuk mengirim data ke server
        fetch('/save-subscription', {
          method: 'POST',
          body: JSON.stringify(subscription),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          console.log('Subscription saved to server:', response);
        }).catch(err => {
          console.error('Error sending subscription to server:', err);
        });
      }).catch(err => {
        console.error('Failed to subscribe the user for push notifications:', err);
      });
    });
  }
});

// Fungsi untuk mengonversi kunci publik VAPID ke uint8 array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
