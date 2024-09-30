const express = require('express');
const itemRouter = express.Router();
const ItemController = require('../controllers/ItemController');
const authentication = require('../middlewares/authentication');

itemRouter.use(authentication);
itemRouter.get('/', ItemController.getAll);

module.exports = itemRouter;
