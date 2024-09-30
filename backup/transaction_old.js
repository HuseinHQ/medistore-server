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
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
      },
      total: {
        type: DataTypes.INTEGER,
      },
      snapToken: {
        type: DataTypes.STRING,
      },
      snapUrl: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'Transaction',
    }
  );
  return Transaction;
};
