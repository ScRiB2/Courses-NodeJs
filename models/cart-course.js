const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const CartCourse = sequelize.define('cartCourse', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    count: Sequelize.INTEGER
});

module.exports = CartCourse;