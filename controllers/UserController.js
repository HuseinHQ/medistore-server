const { comparePassword } = require('../helpers/bcrypt');
const { generateToken } = require('../helpers/jwt');
const { User } = require('../models');

class UserController {
  static async register(req, res, next) {
    try {
      const { email, name, password } = req.body;
      await User.create({ email, name, password });

      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.log('----- /src/controllers/UserController.js -----', error);
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) throw { name: 'NotFoundError', message: 'Invalid Email/Password' };

      const isPasswordMatch = comparePassword(password, user.password);
      if (!isPasswordMatch) throw { name: 'NotFoundError', message: 'Invalid Email/Password' };

      const access_token = generateToken({ id: user.id });
      res.status(200).json({ message: 'Login Success', data: { access_token } });
    } catch (error) {
      console.log('----- /src/controllers/UserController.js -----', error);
      next(error);
    }
  }
}

module.exports = UserController;
