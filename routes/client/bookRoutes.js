const express = require('express');
const router = express.Router();
const bookController = require('../../controllers/client/bookController.js');

router.post('/borrow', bookController.borrowBook);
router.get('/borrowed', bookController.getBorrowedBooks);
router.get('/history', bookController.viewUserHistory);
router.post('/return', bookController.returnBook);
router.get('/:id', bookController.getBookDetail);
router.get('/', bookController.getBooks);

module.exports = router;