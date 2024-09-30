const snap = require('../config/midtrans');
const { Cart, Transaction, TransactionDetail, sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');
const MAX_MIDTRANS_NAME_LENGTH = 50;

class TransactionController {
  static truncateName = (name) => {
    if (name.length > MAX_MIDTRANS_NAME_LENGTH) {
      return name.substring(0, MAX_MIDTRANS_NAME_LENGTH - 3) + '...';
    }
    return name;
  };

  static async createTransaction(req, res, next) {
    try {
      const { id } = req.user;
      const carts = await Cart.findAll({ where: { UserId: id }, include: 'Item' });

      if (!carts.length) {
        throw { name: 'CartEmpty' };
      }

      let grandTotal = 0;
      let transaction;

      await sequelize.transaction(async (t) => {
        transaction = await Transaction.create({ UserId: id, orderId: uuidv4() }, { transaction: t });
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
          expiry: {
            start_time: new Date().toISOString(),
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
      console.log('----- /controllers/TransactionController.js -----', error);
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

      const transaction = await Transaction.findByPk(order_id);
      if (!transaction) {
        throw { name: 'TransactionNotFound' };
      }

      // Klo sudah kebayar itu statusnya capture
      await transaction.update({ status: transaction_status });
    } catch (error) {
      console.log('----- /controllers/TransactionController.js -----', error);
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
      console.log('----- /controllers/TransactionController.js -----', error);
      next(error);
    }
  }
}

module.exports = TransactionController;
