'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transaction.belongsTo(models.User, { foreignKey: 'UserId' });
      Transaction.hasMany(models.TransactionDetail);
    }
  }
  Transaction.init(
    {
      UserId: DataTypes.INTEGER,
      orderId: DataTypes.STRING,
      status: DataTypes.STRING,
      total: DataTypes.INTEGER,
      snapToken: DataTypes.STRING,
      snapUrl: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Transaction',
    }
  );
  return Transaction;
};
