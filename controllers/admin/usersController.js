const db = require('../../config/database.js');
const bcrypt = require('bcrypt');

module.exports = {
    getAllUser: async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Jumlah data per halaman
        const offset = (page - 1) * limit;
    
        try {
            const [total] = await db.query("SELECT COUNT(*) as count FROM users");
            const totalUsers = total[0].count;
            const totalPages = Math.ceil(totalUsers / limit);
        
            const [users] = await db.query("SELECT id, nama, username, email, role FROM users LIMIT ? OFFSET ?", [limit, offset]);
        
            res.render('admin/users/list', { users, page, totalPages, totalUsers });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    },
    getInsertPage: (req, res) => {
        res.render('admin/users/add', {error: null})
    },
    addUser: async (req, res) => {
        const { nama, username, password, confirmPassword, email, role } = req.body;
        
        try {
            if (password !== confirmPassword) {
                return res.render('admin/users/add', { error: 'Password dan konfirmasi password tidak cocok!' });
            }

            const [rows] = await db.query('SELECT * FROM users WHERE username = ? or email = ?', [username, email]);

            if (rows.length > 0) {
                return res.render('admin/users/add', { error: 'Username atau email sudah terdaftar!' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query("INSERT INTO users (nama, username, password, email, role) VALUES (?, ?, ?, ?, ?)", [nama, username, hashedPassword, email, role]);
            res.redirect('/adminUsers');
        } catch (error) {
            console.error('Error saat Menambahkan User:', err);
            res.render('admin/users/add', { error: 'Terjadi kesalahan!' });        
        }
    },
    getUpdatePage: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
            res.render('admin/users/update',  {user : rows[0], error: null})
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    },
    updateUser: async (req, res) => {
        const { id } = req.params;
        const { nama, username, email, password, role } = req.body;

        try {
            const [oldUser] = await db.execute('SELECT password FROM users WHERE id = ?', [id]);
        
            if (!oldUser || oldUser.length === 0) {
                return res.status(404).send('User not found');
            }
    
            let updatedPassword = oldUser[0].password;
    
            if (password && password !== '') {
                // Enkripsi password baru jika ada perubahan
                updatedPassword = await bcrypt.hash(password, 10);
            }
            await db.query("UPDATE users SET nama = ?, username = ?, password = ?, email = ?, role = ? WHERE id = ?", [nama, username, updatedPassword, email, role, id]);
            res.redirect('/adminUsers');
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    },
    deleteUser: async (req, res) => {
        const { id } = req.params;

        try {
            await db.query("DELETE FROM users WHERE id = ?", [id]);
            res.redirect('/adminUsers');
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }
}