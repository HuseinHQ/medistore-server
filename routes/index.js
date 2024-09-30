const express = require('express');
const router = express.Router();

router.use('/user', require('./userRouter'));
router.use('/items', require('./itemRouter'));
router.use('/carts', require('./cartRouter'));
router.use('/transactions', require('./transactionRouter'));

module.exports = router;
