function errorHandler(err, req, res, next) {
  let status = 500;
  let message = 'Internal Server Error';
  let data = null;

  switch (err.name) {
    case 'SequelizeValidationError':
      status = 400;
      message = 'Validation Error';
      data = err.errors.map((error) => error.message);
      break;
    case 'SequelizeUniqueConstraintError':
      status = 400;
      message = 'Unique Constraint Error';
      data = err.errors.map((error) => error.message);
      break;
    case 'NotFoundError':
      status = 404;
      message = err.message;
      break;
    case 'UnauthorizedError':
      status = 401;
      message = err.message || 'Invalid Token';
      break;
    case 'ForbiddenError':
      status = 403;
      message = err.message || 'Forbidden Access';
      break;
    case 'BadRequestError':
      status = 400;
      message = err.message;
      break;
    case 'InternalServerError':
      status = 500;
      message = err.message;
      break;
    case 'CartEmpty':
      status = 400;
      message = 'Cart is empty';
      break;
    case 'TransactionNotFound':
      status = 404;
      message = 'Transaction not found';
      break;
    default:
      status = 500;
      message = err.message;
      break;
  }

  res.status(status).send({ message, data });
}

module.exports = errorHandler;
