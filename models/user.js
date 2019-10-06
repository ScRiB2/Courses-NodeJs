const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const Course = require('../models/seq-course');
const Cart = require('../models/seq-cart');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

const User = sequelize.define('user', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    resetToken: Sequelize.STRING,
    resetTokenExp: Sequelize.DATE,
    avatarUrl: Sequelize.STRING
});

User.prototype.addToCart = function (courseId) {
    let fetchedCart;
    let newCount = 1;
    return this
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            console.log(cart);
            return cart.getCourses({where: {id: courseId}})
        })
        .then(courses => {
            let course;
            if (courses.length > 0) {
                course = courses[0];
            }
            if (course) {
                const oldCount = course.cartCourse.count;
                newCount = oldCount + 1;
                return course;
            }
            return Course.findByPk(courseId)
        })
        .then(course => {
            return fetchedCart.addCourse(course, {
                through: {count: newCount}
            })
        })
        .catch(err => console.log(err));
};

User.prototype.removeFromCart = function (courseId) {
    let fetchedCart;
    return this
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getCourses({where: {id: courseId}})
        })
        .then(courses => {
            const course = courses[0];
            const oldCount = course.cartCourse.count;
            if (oldCount === 1) {
                course.cartCourse.destroy();
            } else {
                const newCount = oldCount - 1;
                return fetchedCart.addCourse(course, {
                    through: {count: newCount}
                })
            }
        })
        .catch(err => console.log(err))
};

User.prototype.clearCart = function () {
    return this
        .getCart()
        .then(cart => {
            return cart.getCourses()
                .then(courses => {
                    for (const course of courses) {
                        course.cartCourse.destroy();
                    }
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
};

User.prototype.createCart = function () {
    return Cart.create().then(cart => this.setCart(cart)).catch(err => console.log(err))
};

User.prototype.generateAuthToken = function () {
    return jwt.sign({id: this.id}, config.get('jwtPrivateKey'))
};

User.prototype.checkPassword = function (password) {
    if (!password) return false;
    return bcrypt.compare(password, this.password);
};

module.exports = User;