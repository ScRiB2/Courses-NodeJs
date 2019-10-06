const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const OrderCourse = sequelize.define('orderCourse', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    count: Sequelize.INTEGER
});



module.exports = OrderCourse;