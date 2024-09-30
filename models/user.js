'use strict';
const { Model } = require('sequelize');
const { hashPassword } = require('../helpers/bcrypt');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Cart, { foreignKey: 'UserId' });
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        unique: { msg: 'Email already exists' },
        validate: {
          isEmail: {
            args: true,
            msg: 'Invalid email format',
          },
        },
      },
      name: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
      hooks: {
        beforeCreate: (user) => {
          const myPlaintextPassword = user.password;
          const hash = hashPassword(myPlaintextPassword);
          user.password = hash;
        },
      },
    }
  );
  return User;
};
