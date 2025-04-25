const express = require('express');
const router = express.Router();
const loginRoutes = require('./loginRoutes.js');
const registerRoutes = require('./registerRoutes.js');
const logoutRoutes = require('./logoutRoutes.js')
const adminBookRoutes = require('./admin/bookRoutes.js');
const adminUserRoutes = require('./admin/userRoutes.js');
const adminHomeController = require('../controllers/admin/homeController.js');

const bookRoutes = require('./client/bookRoutes.js')
const homeController = require('../controllers/client/homeController.js');

router.use('/login', loginRoutes);
router.use('/register', registerRoutes);
router.use('/logout', logoutRoutes)

// admin side routes
router.use('/adminUsers', adminUserRoutes);
router.use('/adminBooks', adminBookRoutes);
router.get('/adminHome', adminHomeController.getHomePage);

// client side routes
router.use('/books', bookRoutes)
router.use('/home', homeController.getHomePage);


router.use((req, res) => {
    res.redirect('/login')
})

module.exports = router;