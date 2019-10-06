const {Router} = require('express');
const router = Router();
const auth = require('../middleware/auth');

function computePrice(courses) {
    return courses.reduce((total, course) => {
        return total += course.price * course.cartCourse.count;
    }, 0)
}

router.post('/add', auth, async (req, res) => {
    await req.user.addToCart(req.body.id);
    res.redirect('/card')
});

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeFromCart(req.params.id);
    req.user.getCart()
        .then(cart => {
            return cart.getCourses()
                .then(courses => {
                    const cart = {
                        courses,
                        price: computePrice(courses)
                    };
                    res.status(200).json(cart);
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err));
});

router.get('/', auth, async (req, res) => {
    await req.user
        .getCart()
        .then(cart => {
            return cart
                .getCourses()
                .then(courses => {
                    res.render('card', {
                        title: 'Корзина',
                        isCard: true,
                        courses,
                        price: computePrice(courses)
                    })
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));

});

module.exports = router;