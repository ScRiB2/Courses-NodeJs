const {Router} = require('express');
const router = Router();
const auth = require('../middleware/auth');

function computePrice(courses) {
    return courses.reduce((total, course) => {
        return total += course.price * course.orderCourse.count;
    }, 0)
}

async function formatOrders(orders) {
    for (const order of orders) {
        const courses = await order.getCourses();
        order.price = computePrice(courses);
        order.courses = courses;
    }
}

router.get('/', auth, async (req, res) => {
    const orders = await req.user.getOrders();
    await formatOrders(orders);
    res.render('orders', {
        title: 'Заказы',
        isOrder: true,
        orders,
        user: req.user
    })
});

router.post('/', auth, (req, res) => {
    req.user.getCart()
        .then(cart => {
            return cart.getCourses();
        })
        .then(courses => {
            return req.user.createOrder()
                .then(order => {
                    order.addCourses(courses.map(course => {
                        course.orderCourse = {count: course.cartCourse.count};
                        return course;
                    }))
                })
                .catch(err => console.log(err))
        })
        .then(async () => {
            await req.user.clearCart();
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
});

module.exports = router;