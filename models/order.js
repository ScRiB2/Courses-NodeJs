const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Order = sequelize.define('order');

module.exports = Order;