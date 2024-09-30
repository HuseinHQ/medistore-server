const express = require('express');
const transactionRouter = express.Router();
const TransactionController = require('../controllers/TransactionController');
const authentication = require('../middlewares/authentication');

transactionRouter.post('/notification', TransactionController.notificationHandler);
transactionRouter.use(authentication);
transactionRouter.get('/:order_id', TransactionController.getTransactionById);
transactionRouter.post('/', TransactionController.createTransaction);

module.exports = transactionRouter;
