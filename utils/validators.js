const {body} = require('express-validator/check');
const User = require('../models/user');

exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Введите корректный email')
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({where: {email: value}});
                if (user) {
                    return Promise.reject('Такой email уже занят')
                }
            } catch (e) {
                console.log(e);
            }
        })
        .normalizeEmail(),
    body('password', 'Пароль минимум 6 символов').isLength({min: 6, max: 56}),
    body('password', 'Пароль должен быть только из букв и цифр').isAlphanumeric().trim(),
    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Пароли должны совпадать')
            }
            return true
        })
        .trim(),
    body('name')
        .isLength({min: 3}).withMessage('Имя минимум 3 символа')
        .trim()
];

exports.loginValidators = [
    body('email')
        .isEmail().withMessage('Введите корректный email')
        .normalizeEmail(),
    body('password')
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({where: {email: req.body.email}});
                if (!user) {
                    return Promise.reject('Пользователя с таким email нет')
                }
                if (!(await user.checkPassword(value))) {
                    return Promise.reject('Неверный пароль')
                }
                return true
            } catch (e) {
                console.log(e);
            }
        })
];

exports.courseValidators = [
    body('title')
        .isLength({min: 3}).withMessage('Минимальная длина названия 3 символа').trim(),
    body('price').isNumeric().withMessage('Введите корректную цену'),
    body('img', 'Введите корректный URL картинки').isURL()
];