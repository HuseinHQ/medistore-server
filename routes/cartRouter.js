const express = require('express');
const cartRouter = express.Router();
const CartController = require('../controllers/CartController');
const authentication = require('../middlewares/authentication');

cartRouter.use(authentication);
cartRouter.get('/', CartController.getCarts);
cartRouter.post('/:item_id', CartController.addToCart);
cartRouter.patch('/:cart_id/increase', CartController.increaseQuantity);
cartRouter.patch('/:cart_id/decrease', CartController.decreaseQuantity);
cartRouter.delete('/:cart_id', CartController.removeFromCart);

module.exports = cartRouter;
