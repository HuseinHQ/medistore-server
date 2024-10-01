const express = require('express');
const itemRouter = express.Router();
const ItemController = require('../controllers/ItemController');

itemRouter.get('/', ItemController.getAll);

module.exports = itemRouter;
