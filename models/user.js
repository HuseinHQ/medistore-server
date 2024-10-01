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
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [6],
            msg: 'Password must be at least 6 characters',
          },
          notEmpty: {
            args: true,
            msg: 'Password is required',
          },
          notNull: {
            args: true,
            msg: 'Password is required',
          },
        },
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'First name is required',
          },
          notNull: {
            args: true,
            msg: 'First name is required',
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Last name is required',
          },
          notNull: {
            args: true,
            msg: 'Last name is required',
          },
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Phone number is required',
          },
          notNull: {
            args: true,
            msg: 'Phone number is required',
          },
        },
      },
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
