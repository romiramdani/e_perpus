const db = require('../../config/database');

module.exports = {
    getHomePage: async (req, res) => {
        try {            
            if (!req.session.user) {
                    return res.redirect('/login');         
            }
            const [books] = await db.query("SELECT COUNT(*) as count FROM books");
            const totalBooks = books[0].count;
            const [history] = await db.query("SELECT COUNT(*) as count FROM history WHERE user_id = ?", [req.session.user.id])
            const totalPeminjaman = history[0].count;
            const [users] = await db.query("SELECT COUNT(*) as count FROM users where role = 2");
            const totalUser = users[0].count;
            const [favorite] = await db.query("SELECT judul FROM books ORDER BY jml_peminjaman DESC LIMIT 1")
            const bukuFavorit = favorite[0];
            res.render('client/index', { username: req.session.user.username, totalBooks, totalUser, totalPeminjaman, bukuFavorit});
        } catch (error) {
            return res.redirect('/login');         
        }
    }
}