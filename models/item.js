'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Item.hasMany(models.Cart, { foreignKey: 'ItemId' });
    }
  }
  Item.init(
    {
      name: DataTypes.STRING,
      price: DataTypes.INTEGER,
      imgUrl: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Item',
    }
  );
  return Item;
};
