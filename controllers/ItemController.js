const { Item } = require('../models');

class ItemController {
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const items = await Item.findAndCountAll({ offset, limit });

      const pagination = {
        count: items.count,
        limit,
        offset,
        page,
        totalPage: Math.ceil(items.count / limit),
      };

      res.status(200).json({ data: items.rows, pagination });
    } catch (error) {
      console.log('----- /controllers/ItemController.js -----', error);
      next(error);
    }
  }

  static async getItemById(req, res, next) {
    try {
      const { itemId } = req.params;
      const item = await Item.findByPk(itemId);

      if (!item) throw { name: 'ItemNotFound' };

      res.status(200).json({ data: item });
    } catch (error) {
      console.log('----- /controllers/ItemController.js -----', error);
      next(error);
    }
  }
}

module.exports = ItemController;
