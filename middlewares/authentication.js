const { verifyToken } = require('../helpers/jwt');

function authentication(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) return next({ name: 'UnauthorizedError', message: 'Please login first' });

  try {
    const access_token = authorization.split('Bearer ')[1];
    const payload = verifyToken(access_token, 'rahasia123@#$');
    req.user = payload;
    next();
  } catch (error) {
    console.log('----- /middlewares/authentication.js -----', error);
    next(error);
  }
}

module.exports = authentication;
