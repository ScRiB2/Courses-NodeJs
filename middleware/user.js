const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/user');

module.exports = async function (req, res, next) {
    const token = req.session.token;
    if (!token) {
        return next();
    }
    try{
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = await User.findByPk(decoded.id);
        next();
    }
    catch (ex) {
        req.session.destroy();
        res.redirect('/auth/login');
    }
};