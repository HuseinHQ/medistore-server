'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TransactionDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TransactionDetail.belongsTo(models.Transaction);
      TransactionDetail.belongsTo(models.Item, { foreignKey: 'ItemId' });
    }
  }
  TransactionDetail.init(
    {
      TransactionId: DataTypes.INTEGER,
      ItemId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      price: DataTypes.INTEGER,
      totalPrice: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'TransactionDetail',
    }
  );
  return TransactionDetail;
};
