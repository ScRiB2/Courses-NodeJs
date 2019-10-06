const {Router} = require('express');
const router = Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
   res.render('profile', {
       title: 'Профиль',
       isProfile: true,
       user: req.user
   })
});

router.post('/', auth, async (req, res) => {
    try{
        const user = await User.findByPk(req.user.id);

        const toChange = {
            name: req.body.name
        };
        if (req.file) {
            toChange.avatarUrl = req.file.path
        }

        Object.assign(user, toChange);
        await user.save();
        res.redirect('/profile')
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;