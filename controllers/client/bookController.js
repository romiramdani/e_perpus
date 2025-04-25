const db = require('../../config/database.js');

module.exports = {
    getBooks: async (req, res) => {
        const [books] = await db.query(`
            SELECT * FROM books WHERE stok > 0
        `);
        const [borrowedBooks] = await db.query(`
            SELECT book_id FROM history WHERE user_id = ? AND status = 'dipinjam' OR status = 'pending_borrow'
        `, [req.session.user.id]); // Mendapatkan daftar buku yang sudah dipinjam oleh user
        
        // Menandai buku yang sudah dipinjam oleh user agar tombol pinjam hilang
        const borrowedBookIds = borrowedBooks.map(book => book.book_id);
        
        res.render('client/books', { books, borrowedBookIds });
    },

    getBookDetail : async (req, res) => {
        const { id } = req.params;
        try {
            const [book] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
            
            if (book.length === 0) {
                return res.status(404).send('Buku tidak ditemukan');
            }
    
            // Kirim data buku ke halaman detail
            res.render('client/detail', { book: book[0] });
        } catch (err) {
            res.status(500).send('Terjadi kesalahan: ' + err.message);
        }
    
    },
    
    // Memproses peminjaman buku
    borrowBook: async (req, res) => {
        const { bookId } = req.body;
        const userId = req.session.user.id;
        
        // Periksa apakah buku masih tersedia
        const [book] = await db.query('SELECT * FROM books WHERE id = ? AND stok > 0', [bookId]);
        if (book.length > 0) {
            // Menambahkan permintaan peminjaman ke history
            await db.query(`
                INSERT INTO history (user_id, book_id, tanggal_peminjaman, status)
                VALUES (?, ?, NOW(), 'pending_borrow')
            `, [userId, bookId]);
            
            // Kurangi stok buku dan tambah jumlah peminjaman
            await db.query('UPDATE books SET stok = stok - 1, jml_peminjaman = jml_peminjaman + 1 WHERE id = ?', [bookId]);
    
            res.redirect('/books'); // Kembali ke halaman buku
        } else {
            res.status(400).send('Buku tidak tersedia');
        }
    },
    
    // Halaman Buku yang Dipinjam - Menampilkan buku yang sedang dipinjam
    getBorrowedBooks: async (req, res) => {
        const userId = req.session.user.id;
    
        const [borrowedBooks] = await db.query(`
            SELECT h.id, b.judul, h.tanggal_peminjaman
            FROM history h
            JOIN books b ON h.book_id = b.id
            WHERE h.user_id = ? AND h.status = 'dipinjam'
        `, [userId]);
    
        res.render('client/borrowed', { borrowedBooks });
    },
    
    // Mengajukan pengembalian buku
    returnBook: async (req, res) => {
        const { historyId } = req.body;
    
        await db.query('UPDATE history SET status = "pending_return" WHERE id = ?', [historyId]);
    
        res.redirect('/books/borrowed');
    },
    viewUserHistory: async (req, res) => {
        const userId = req.session.user.id;
    
        try {
            const [history] = await db.query(
                'SELECT h.*, b.judul FROM history h JOIN books b ON h.book_id = b.id WHERE h.user_id = ? ORDER BY h.tanggal_peminjaman DESC',
                [userId]
            );
            
            res.render('client/history', { history });
        } catch (err) {
            res.status(500).send('Terjadi kesalahan: ' + err.message);
        }
    }
}