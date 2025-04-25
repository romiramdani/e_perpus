const express = require('express');
const router = express.Router();
const adminUserControllers = require('../../controllers/admin/usersController')

router.get('/update/:id', adminUserControllers.getUpdatePage);
router.post('/update/:id', adminUserControllers.updateUser);
router.get('/add', adminUserControllers.getInsertPage);
router.post('/', adminUserControllers.addUser);
router.get('/delete/:id', adminUserControllers.deleteUser);
router.get('/', adminUserControllers.getAllUser);

module.exports = router