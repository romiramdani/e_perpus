const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js')

router.get('/', authController.getRegisterPage);
router.post('/', authController.register);

module.exports = router;