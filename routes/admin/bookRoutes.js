const express = require('express');
const router = express.Router();
const adminBookControllers = require('../../controllers/admin/bookController')

router.get('/update/:id', adminBookControllers.getUpdatePage)
router.post('/update/:id', adminBookControllers.updateBook)
router.get('/delete/:id', adminBookControllers.deleteBook)
router.post('/borrow/confirm', adminBookControllers.confirmBorrowRequest);
router.post('/borrow/reject', adminBookControllers.rejectBorrowRequest);
router.get('/borrow', adminBookControllers.getBorrowRequests);
router.post('/return/confirm', adminBookControllers.confirmReturnRequest);
router.post('/return/reject', adminBookControllers.rejectReturnRequest);
router.get('/return', adminBookControllers.getReturnRequests);
router.get('/history', adminBookControllers.getHistory);
router.get('/add', adminBookControllers.getInsertPage);
router.get('/:id', adminBookControllers.getBookDetail);
router.post('/', adminBookControllers.addBook)
router.get('/', adminBookControllers.getAllBooks);

module.exports = router;