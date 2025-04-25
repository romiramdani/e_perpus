const db = require("../../config/database")

module.exports = {
    getHomePage: async (req, res) => {
        try {
            const [total] = await db.query("SELECT COUNT(*) as count FROM books");
            const [history] = await db.query("SELECT COUNT(*) as count FROM history");
            const [users] = await db.query("SELECT COUNT(*) as count FROM users where role = 2");
            const [favorite] = await db.query("SELECT judul FROM books ORDER BY jml_peminjaman DESC LIMIT 1")
            const totalBooks = total[0].count;
            const totalPeminjaman = history[0].count;
            const totalUser = users[0].count;
            const bukuFavorit = favorite[0];
            if (!req.session.user) {
                return res.redirect('/login');
            }
            res.render('admin/index', { username: req.session.user.username, totalBooks, totalUser, totalPeminjaman, bukuFavorit});
            
        } catch (error) {
            return res.redirect('/login');
        }
    }
}