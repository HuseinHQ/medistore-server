const snap = require('../config/midtrans');
const { Cart, Transaction, TransactionDetail, sequelize, User, Item } = require('../models');
const { v4: uuidv4 } = require('uuid');
const MAX_MIDTRANS_NAME_LENGTH = 50;
const moment = require('moment-timezone');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const generateInvoice = require('../helpers/generateInvoice');

class TransactionController {
  static truncateName = (name) => {
    if (name.length > MAX_MIDTRANS_NAME_LENGTH) {
      return name.substring(0, MAX_MIDTRANS_NAME_LENGTH - 3) + '...';
    }
    return name;
  };

  static async getTransactions(req, res, next) {
    try {
      const { id } = req.user;
      const { status } = req.query;

      const where = { UserId: id };
      if (status && status !== 'all') {
        where.status = status;
      }

      const transactions = await Transaction.findAll({
        where,
        include: {
          model: TransactionDetail,
          include: Item,
        },

        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({ message: 'Transactions found', data: transactions });
    } catch (error) {
      console.log('----- /controllers/TransactionController.js (getTransactions) -----', error);
      next(error);
    }
  }

  static async createTransaction(req, res, next) {
    try {
      const { id } = req.user;
      const carts = await Cart.findAll({ where: { UserId: id }, include: 'Item' });

      if (!carts.length) {
        throw { name: 'CartEmpty' };
      }

      const findUser = await User.findByPk(id);

      let grandTotal = 0;
      let transaction;

      await sequelize.transaction(async (t) => {
        transaction = await Transaction.create(
          { UserId: id, orderId: uuidv4(), status: 'pending' },
          { transaction: t }
        );
        const mappedCart = carts.map((cart) => {
          const totalPrice = cart.quantity * cart.Item.price;
          grandTotal += totalPrice;

          return {
            TransactionId: transaction.id,
            ItemId: cart.ItemId,
            quantity: cart.quantity,
            price: cart.Item.price,
            totalPrice,
          };
        });

        const midtransFormattedCarts = carts.map((cart) => {
          return {
            id: cart.Item.id,
            price: cart.Item.price,
            quantity: cart.quantity,
            name: TransactionController.truncateName(cart.Item.name),
          };
        });

        let parameter = {
          transaction_details: {
            order_id: transaction.orderId,
            gross_amount: grandTotal,
          },
          credit_card: {
            secure: true,
          },
          item_details: midtransFormattedCarts,
          customer_details: {
            first_name: findUser.firstName,
            last_name: findUser.lastName,
            email: findUser.email,
            phone: findUser.phoneNumber,
          },
          expiry: {
            start_time: moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss Z'),
            unit: 'days',
            duration: 1,
          },
        };

        const midtransTransaction = await snap.createTransaction(parameter);
        const { redirect_url, token } = midtransTransaction;

        await TransactionDetail.bulkCreate(mappedCart, { transaction: t });
        await Cart.destroy({ where: { UserId: id } }, { transaction: t });
        await transaction.update({ total: grandTotal, snapUrl: redirect_url, snapToken: token }, { transaction: t });
      });

      res.status(200).json({ message: 'Transaction created successfully', data: transaction });
    } catch (error) {
      console.log('----- /controllers/TransactionController.js (createTransaction) -----', error);
      next(error);
    }
  }

  static async notificationHandler(req, res, next) {
    try {
      const {
        transaction_time,
        transaction_status,
        transaction_id,
        status_message,
        status_code,
        signature_key,
        settlement_time,
        payment_type,
        order_id,
        merchant_id,
        gross_amount,
        fraud_status,
        currency,
      } = req.body;

      const transaction = await Transaction.findOne({ where: { orderId: order_id } });
      if (!transaction) {
        throw { name: 'TransactionNotFound' };
      }

      if (transaction_status == 'capture') {
        if (fraud_status == 'challenge') {
          await transaction.update({ status: 'challenge' });
        } else if (fraud_status == 'accept') {
          await transaction.update({ status: 'success' });
        }
      } else if (transaction_status == 'settlement') {
        await transaction.update({ status: 'success' });
      } else if (transaction_status == 'deny') {
        // TODO you can ignore 'deny', because most of the time it allows payment retries
        // and later can become success
      } else if (transaction_status == 'cancel' || transaction_status == 'expire') {
        await transaction.update({ status: 'failure' });
      } else if (transaction_status == 'pending') {
        await transaction.update({ status: 'pending' });
      }

      res.status(200).json({ message: 'Notification received' });
    } catch (error) {
      console.log('----- /controllers/TransactionController.js (notificationHandler) -----', error);
      next(error);
    }
  }

  static async getTransactionById(req, res, next) {
    try {
      const { order_id } = req.params;
      const { id } = req.user;
      const transaction = await Transaction.findByPk(order_id, { include: 'TransactionDetails' });

      if (!transaction) {
        throw { name: 'TransactionNotFound' };
      }

      if (transaction.UserId !== id) {
        throw { name: 'ForbiddenError', message: 'You are not authorized' };
      }

      if (!transaction) {
        throw { name: 'TransactionNotFound' };
      }

      res.status(200).json({ message: 'Transaction found', data: transaction });
    } catch (error) {
      console.log('----- /controllers/TransactionController.js (getTransactionById) -----', error);
      next(error);
    }
  }

  static async getInvoice(req, res, next) {
    try {
      const { id } = req.params;

      const transactions = await Transaction.findByPk(id, {
        include: {
          model: TransactionDetail,
          include: Item,
        },
      });

      if (!transactions) {
        throw { name: 'TransactionNotFound' };
      }

      const pdfPath = generateInvoice(transactions);

      res.status(200).json({ message: 'PDF generated', data: { pdfPath } });
    } catch (error) {
      console.log('----- /controllers/TransactionController.js (getInvoice) -----', error);
      next(error);
    }
  }
}

module.exports = TransactionController;
