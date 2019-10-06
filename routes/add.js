const {Router} = require('express');
const router = Router();
const Course = require("../models/seq-course");
const auth = require('../middleware/auth');
const {validationResult} = require('express-validator/check');
const {courseValidators} = require('../utils/validators');

router.get('/', auth, (req, res) => {
    res.render('add', {
        title: 'Добавить курс',
        isAdd: true
    })
});

router.post('/', auth, courseValidators, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('add', {
                title: 'Добавить курс',
                isAdd: true,
                error: errors.array()[0].msg,
                data: {
                    title: req.body.title,
                    price: req.body.price,
                    img: req.body.img,
                }
            })
        }
        await Course.create({
            title: req.body.title,
            price: req.body.price,
            img: req.body.img,
            userId: req.user.id
        }).catch(err => console.log(err));
        res.redirect('/courses');
    } catch (e) {
        console.log(e)
    }
});


module.exports = router;