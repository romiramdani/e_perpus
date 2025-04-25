const fs = require('fs');
const path = require('path');  // Mengimpor konfigurasi multer
const db = require('../../config/database.js')
const upload = require('../../config/multer.js');

// Menampilkan Semua Buku
module.exports = {
  getAllBooks : async (req, res) => {
    const [books] = await db.query("SELECT * FROM books");
    try {
      res.render('admin/books/list', {books});
    } catch (err) {
      res.status(500).send('Terjadi kesalahan: ' + err.message);
    }
  },

  getBookDetail : async (req, res) => {
    const { id } = req.params;
    try {
        const [book] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
        
        if (book.length === 0) {
            return res.status(404).send('Buku tidak ditemukan');
        }

        // Kirim data buku ke halaman detail
        res.render('admin/books/detail', { book: book[0] });
    } catch (err) {
        res.status(500).send('Terjadi kesalahan: ' + err.message);
    }

  },
  
  getInsertPage: (req, res) => {
    res.render('admin/books/add', {error: null})
},

  addBook: async (req, res) => {
    upload.single('gambar')(req, res, async (err) => {
      if (err) {
        return res.status(400).send(err.message);
      }
  
      const { judul, penulis, penerbit, kota_terbit, tahun_terbit, stok, harga, deskripsi } = req.body;
      const gambar = req.file ? req.file.filename : '';
  
      try {
        await db.query(
          'INSERT INTO books (judul, penulis, penerbit, kota_terbit, tahun_terbit, stok, harga, deskripsi, gambar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [judul, penulis, penerbit, kota_terbit, tahun_terbit, stok, harga, deskripsi, gambar]
        );
        res.redirect('/adminBooks');
      } catch (err) {
        res.status(500).send('Terjadi kesalahan: ' + err.message);
      }
    });
  },
  
  getUpdatePage: async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query("SELECT * FROM books WHERE id = ?", [id]);
        res.render('admin/books/update',  {book : rows[0], error: null})
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
  },
  // Mengedit Buku
  updateBook: async (req, res) => {
    const bookId = req.params.id;

    // Gunakan middleware upload.single untuk memproses gambar baru
    upload.single('gambar')(req, res, async (err) => {
        if (err) {
            return res.status(400).send('Gagal mengunggah gambar: ' + err.message);
        }

        // Mengambil data dari body
        const { judul, penulis, penerbit, kota_terbit, tahun_terbit, stok, harga, deskripsi } = req.body;
        
        // Tentukan gambar baru jika diunggah, atau gunakan gambar lama jika tidak

        try {
          const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [bookId]);
          if (rows.length === 0) {
            return res.status(404).json({ message: 'Buku tidak ditemukan' });
          }
          const book = rows[0];

          // Hapus gambar lama jika gambar baru diunggah
          if (req.file && book.gambar) {
            const oldImagePath = path.join(__dirname, 'public', 'image', 'books', book.gambar);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
          const updatedImage = req.file ? req.file.filename : book.gambar;

            // Query untuk memperbarui data buku di database
            await db.query(
                `UPDATE books SET judul = ?, penulis = ?, penerbit = ?, kota_terbit = ?, tahun_terbit = ?, stok = ?, harga = ?, deskripsi = ?, gambar = ? WHERE id = ?`,
                [judul, penulis, penerbit, kota_terbit, tahun_terbit, stok, harga, deskripsi, updatedImage, bookId]
            );

            // Redirect ke halaman detail buku yang diupdate
            res.redirect(`/adminBooks/${bookId}`);
        } catch (err) {
            res.status(500).send('Terjadi kesalahan saat mengupdate buku: ' + err.message);
        }
      });
    },
  // Menghapus Buku
  deleteBook: async (req, res) => {
    try {
      const bookId = req.params.id;

      // Ambil data buku dari database
      const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [bookId]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Buku tidak ditemukan' });
      }
  
      const book = rows[0];
  
      // Hapus gambar jika ada
      if (book.gambar) {
        const imagePath = path.join(__dirname, 'public', 'image', 'books', book.gambar);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
  
      // Hapus data buku dari database
      await db.query('DELETE FROM history WHERE book_id = ?', [bookId]);
      await db.query('DELETE FROM books WHERE id = ?', [bookId]);
      res.redirect('/adminBooks')
    } catch (err) {
      res.status(500).send('Terjadi kesalahan: ' + err.message);
    }
  },
  getBorrowRequests: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Jumlah data per halaman
    const offset = (page - 1) * limit;

    try {
      const [total] = await db.query("SELECT COUNT(*) as count FROM history WHERE status = 'pending_borrow'");
      const totalRequest = total[0].count;
      
      const totalPages = Math.ceil(totalRequest / limit);
      const [requests] = await db.query(
          `SELECT h.id, b.judul, u.username, h.tanggal_peminjaman, h.status FROM history h JOIN books b ON h.book_id = b.id JOIN users u ON h.user_id = u.id WHERE h.status = 'pending_borrow' LIMIT ? OFFSET ?`, [limit, offset]
        );
      res.render('admin/books/borrow', { requests, page, totalPages, totalRequest });
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  },
// Halaman Pengembalian - Daftar permintaan pengembalian buku
  getReturnRequests: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Jumlah data per halaman
    const offset = (page - 1) * limit;

    try {
      const [total] = await db.query("SELECT COUNT(*) as count FROM history WHERE status = 'dipinjam'");
      const totalRequest = total[0].count;
      
      const totalPages = Math.ceil(totalRequest / limit);
      const [requests] = await db.query(
        `SELECT h.id, b.judul, u.username, h.tanggal_peminjaman, h.status FROM history h JOIN books b ON h.book_id = b.id JOIN users u ON h.user_id = u.id WHERE h.status = 'pending_return' LIMIT ? OFFSET ?`, [limit, offset]
      );
      res.render('admin/books/return', { requests, page, totalPages, totalRequest });
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  },

// Halaman History - Menampilkan semua riwayat peminjaman dan pengembalian
  getHistory: async (req, res) => {
    const [history] = await db.query(`
        SELECT h.id, b.judul, u.username, h.tanggal_peminjaman, h.tanggal_pengembalian, h.status
        FROM history h
        JOIN books b ON h.book_id = b.id
        JOIN users u ON h.user_id = u.id
    `);
        
    res.render('admin/books/history', { history });
  },

// Mengonfirmasi peminjaman buku
  confirmBorrowRequest: async (req, res) => {
    const { id } = req.body;
    
    // Update status peminjaman buku dan kurangi stok
    await db.query(
      `UPDATE history h JOIN books b ON h.book_id = b.id SET h.status = 'dipinjam' WHERE h.id = ? AND b.stok >= 0`, [id]
    );
    res.redirect('/adminBooks/borrow');
  },

  rejectBorrowRequest: async (req, res) => {
    const { id } = req.body;
    
    // Update status menjadi ditolak
    await db.query(
      `UPDATE history h JOIN books b ON h.book_id = b.id SET h.status = 'ditolak', b.stok = b.stok + 1, b.jml_peminjaman = b.jml_peminjaman - 1 WHERE h.id = ? AND b.stok >= 0`, [id]
    );
    res.redirect('/adminBooks/borrow');
  },

// Mengonfirmasi pengembalian buku
  confirmReturnRequest: async (req, res) => {
    const { id } = req.body;

    // Update status pengembalian dan kembalikan stok
    await db.query(`
        UPDATE history h
        JOIN books b ON h.book_id = b.id
        SET h.tanggal_pengembalian = NOW(), h.status = 'dikembalikan', b.stok = b.stok + 1
        WHERE h.id = ?
    `, [id]);
    res.redirect('/adminBooks/return');
  },

// Menolak peminjaman atau pengembalian
  rejectReturnRequest: async (req, res) => {
    const { id } = req.body;
    
    // Update status menjadi ditolak
    await db.query('UPDATE history SET status = "dipinjam" WHERE id = ?', [id]);
    res.redirect('/adminBooks/return');
  },
}