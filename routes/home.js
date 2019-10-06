const {Router} = require('express');
const router = Router();
const User = require('../models/user');
const Cart = require('../models/seq-cart');

router.get('/', async (req, res) => {
    res.render('index', {
        title: "Главная страница",
        isHome: true
    })
});


module.exports = router;