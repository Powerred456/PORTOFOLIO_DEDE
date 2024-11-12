const express = require('express');
const path = require('path');
const app = express();

// Set folder "assets" untuk static files seperti CSS, JS, dan gambar
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Render file index.html saat mengunjungi root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Menentukan port yang akan digunakan (misalnya, 3000)
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${8080}`);
});
