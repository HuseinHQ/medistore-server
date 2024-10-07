const { Item, Cart } = require('../models');

class CartController {
  static async getCarts(req, res, next) {
    try {
      const { id } = req.user;

      const carts = await Cart.findAll({ where: { UserId: id }, include: Item });
      const mappedCarts = carts.map((cart) => ({
        cartId: cart.id,
        itemId: cart.Item.id,
        quantity: cart.quantity,
        name: cart.Item.name,
        price: cart.Item.price,
        imgUrl: cart.Item.imgUrl,
      }));

      res.status(200).json({ data: mappedCarts });
    } catch (error) {
      console.log('----- /controllers/CartController.js -----', error);
      next(error);
    }
  }

  static async addToCart(req, res, next) {
    try {
      const { quantity = 1 } = req.body;
      const { item_id } = req.params;
      const { id } = req.user;

      const item = await Item.findByPk(item_id);
      if (!item) throw { name: 'NotFoundError', message: 'Item not found' };

      const CartItem = await Cart.findOne({ where: { ItemId: item_id, UserId: id } });
      if (CartItem) {
        const newQuantity = CartItem.quantity + quantity;
        await Cart.update({ quantity: newQuantity }, { where: { ItemId: item_id, UserId: id } });
      } else {
        await Cart.create({ ItemId: item_id, UserId: id, quantity });
      }

      res.status(201).json({ message: 'Item added to cart successfully' });
    } catch (error) {
      console.log('----- /controllers/CartController.js -----', error);
      next(error);
    }
  }

  static async increaseQuantity(req, res, next) {
    try {
      const { item_id } = req.params;
      const { id } = req.user;

      const CartItem = await Cart.findOne({ where: { ItemId: item_id, UserId: id } });
      if (!CartItem) throw { name: 'NotFoundError', message: 'Item not found' };

      const newQuantity = CartItem.quantity + 1;
      await Cart.update({ quantity: newQuantity }, { where: { ItemId: item_id, UserId: id } });

      res.status(200).json({ message: 'Item quantity increased successfully' });
    } catch (error) {
      console.log('----- /controllers/CartController.js -----', error);
      next(error);
    }
  }

  static async decreaseQuantity(req, res, next) {
    try {
      const { item_id } = req.params;
      const { id } = req.user;

      const CartItem = await Cart.findOne({ where: { ItemId: item_id, UserId: id } });
      if (!CartItem) throw { name: 'NotFoundError', message: 'Item not found' };

      if (CartItem.quantity > 1) {
        const newQuantity = CartItem.quantity - 1;
        await Cart.update({ quantity: newQuantity }, { where: { ItemId: item_id, UserId: id } });
      }

      res.status(200).json({ message: 'Item quantity decreased successfully' });
    } catch (error) {
      console.log('----- /controllers/CartController.js -----', error);
      next(error);
    }
  }

  static async removeFromCart(req, res, next) {
    try {
      const { item_id } = req.params;
      const { id } = req.user;

      const CartItem = await Cart.findOne({ where: { ItemId: item_id, UserId: id } });
      if (!CartItem) throw { name: 'NotFoundError', message: 'Item not found' };

      await Cart.destroy({ where: { ItemId: item_id, UserId: id } });

      res.status(200).json({ message: 'Item removed from cart successfully' });
    } catch (error) {
      console.log('----- /controllers/CartController.js -----', error);
      next(error);
    }
  }
}

module.exports = CartController;
