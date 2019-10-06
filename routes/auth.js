const {Router} = require('express');
const router = Router();
const User = require('../models/user');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator/check');
const {registerValidators, loginValidators} = require('../utils/validators');

const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const config = require('config');
const crypto = require('crypto');

const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: config.get('sendgridApiKey')}
}));

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        registerError: req.flash('registerError'),
        loginError: req.flash('loginError')
    })
});

router.post('/register', registerValidators, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('registerError', errors.array()[0].msg);
        return res.status(422).redirect('/auth/login#register')
    }
    const newUser = _.pick(req.body, ['name', 'email', 'password']);
    newUser.password = await bcrypt.hash(newUser.password, 10);
    await User.create(newUser).then(user => user.createCart());
    res.redirect('/auth/login#login');
    await transporter.sendMail(regEmail(req.body.email));
});

router.post('/login', loginValidators, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('loginError', errors.array()[0].msg);
        return res.status(422).redirect('/auth/login#login');
    }
    const user = await User.findOne({where: {email: req.body.email}});
    req.session.token = user.generateAuthToken();
    req.session.isAuthenticated = true;
    return req.session.save(err => {
        if (err) console.log(err);
        res.redirect('/')
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login#login');
});

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Сбросить пароль',
        error: req.flash('error')
    });
});

router.post('/reset', (req, res) => {
    crypto.randomBytes(32, async (err, buffer) => {
        if (err) {
            req.flash('error', 'Что-то пошло не так повторите попытку позже');
            return res.redirect('/auth/reset')
        }
        const token = buffer.toString('hex');

        const user = await User.findOne({where: {email: req.body.email}});

        if (user) {
            user.resetToken = token;
            user.resetTokenExp = Date.now() + 60 * 60 * 1000;
            await user.save();
            await transporter.sendMail(resetEmail(user.email, token));
            res.redirect('/auth/login')
        } else {
            req.flash('error', 'Такого email нет');
            res.redirect('/auth/reset')
        }
    })
});

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        req.flash('loginError', 'Нет так');
        return res.redirect('/auth/login')
    }

    const user = await User.findOne({
        where: {
            resetToken: req.params.token,
            resetTokenExp: {
                [Op.gt]: Date.now()
            }
        }
    }).catch(err => console.log(err));

    if (!user) {
        req.flash('loginError', 'Повторите попытку');
        return res.redirect('/auth/login')
    } else {
        res.render('auth/password', {
            title: 'Новый пароль',
            error: req.flash('error'),
            userId: user.id.toString(),
            token: req.params.token
        });
    }
});

router.post('/password', async (req, res) => {
    const user = await User.findOne({
        where: {
            id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {
                [Op.gt]: Date.now()
            }
        }
    }).catch(err => console.log(err));

    console.log(user);

    if (user) {
        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetToken = null;
        user.resetTokenExp = null;
        await user.save();
        res.redirect('/auth/login')
    } else {
        req.flash('loginError', 'Время жизни токена истекло');
        res.redirect('/auth/login')
    }
});

module.exports = router;