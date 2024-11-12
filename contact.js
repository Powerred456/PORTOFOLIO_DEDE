// Menginisialisasi EmailJS dengan public key kamu
(function() {
    emailjs.init('R8a9ooZ0vuYZlurfU');  // Gantilah dengan publicKey yang sudah kamu dapatkan
})();

// Menangani form submission
window.onload = function() {
    document.getElementById('contact-form').addEventListener('submit', function(event) {
        event.preventDefault();  // Mencegah halaman reload setelah submit

        // Mengirimkan form dengan menggunakan EmailJS
        emailjs.sendForm('contact_service', 'contact_form', this)
            .then(function(response) {
                // Pesan berhasil
                alert('Your message has been sent successfully!');
                document.getElementById('contact-form').reset();  // Reset form setelah berhasil
            }, function(error) {
                // Pesan error jika gagal
                alert('Sorry, something went wrong. Please try again later.');
                console.error('Failed...', error);
            });
    });
};
