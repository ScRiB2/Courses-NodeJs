const Sequelize = require('sequelize');

const DB_NAME = 'course-shop';
const USER_NAME = 'postgres';
const PASSWORD = 'postgres';

const sequelize = new Sequelize(DB_NAME, USER_NAME, PASSWORD, {
    host: 'localhost',
    dialect: 'postgres',
    // define: {
    //     timestamps: false
    // }
});

// const sequelize = new Sequelize('postgres://postgres:postgres@localhost/course-shop');

module.exports = sequelize;

