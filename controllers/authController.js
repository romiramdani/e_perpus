const db = require('../config/database.js');
const bcrypt = require('bcrypt');

module.exports = {
    getLoginPage: (req, res) => {
        res.render('login', { error: null });
    },

    login: async (req, res) => {
        const { username, password } = req.body;
        try {
            const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
            if (rows.length === 0) {
                return res.render('login', { error: 'Username tidak ditemukan!' });
            }
            const user = rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.user = { id: user.id, username: user.username };
                if (user.role == 1) {
                    return res.redirect('/adminHome');
                } else if (user.role == 2) {
                    res.redirect('/home');
                }
            } else {
                res.render('login', { error: 'Password salah!' });
            }
        } catch (err) {
            // console.error('Error saat login:', err);
            res.render('login', { error: 'Terjadi kesalahan!' });
        }
    },

    getRegisterPage: (req, res) => {
        res.render('register', { error: null });
    },

    register: async (req, res) => {
        const { nama, username, password, email, confirmPassword } = req.body;

        try {
            if (password !== confirmPassword) {
                return res.render('register', { error: 'Password dan konfirmasi password tidak cocok!' });
            }

            const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

            if (rows.length > 0) {
                return res.render('register', { error: 'Username sudah terdaftar!' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            await db.query('INSERT INTO users (nama, username, password, email, role) VALUES (?, ?, ?, ?, ?)', [
                nama,
                username,
                hashedPassword,
                email,
                2,
            ]);

            res.redirect('/login');
        } catch (err) {
            console.error('Error saat register:', err);
            res.render('register', { error: 'Terjadi kesalahan!' });
        }
    },
    logout : async (req, res) => {
        req.session.destroy((err) => {
          if (err) {
            return res.status(500).send('Gagal melakukan logout');
          }
          res.redirect('/login'); // Setelah logout, arahkan kembali ke halaman utama
        });
    }
}
