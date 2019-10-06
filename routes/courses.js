const auth = require('../middleware/auth');
const {Router} = require('express');
const Course = require('../models/seq-course');
const User = require('../models/user');
const router = Router();
const {validationResult} = require('express-validator/check');
const {courseValidators} = require('../utils/validators');

function isOwner(course, req) {
    return course.userId === req.user.id
}

router.get('/', async (req, res) => {
    try {
        const courses = await Course.findAll({
            raw: true,
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: User,
                    attributes: ['email', 'name']
                }
            ],
        });
        res.render('courses', {
            title: 'Курсы',
            isCourses: true,
            userId: req.user ? req.user.id : null,
            courses
        })
    } catch (e) {
        console.log(e)
    }
});

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }
    try {
        const course = await Course.findByPk(req.params.id);
        if (!isOwner(course, req)) {
            return res.redirect('/courses')
        }
        res.render('course-edit', {
            title: `Редактировать ${course.title}`,
            course,
            error: req.flash('error')
        })
    } catch (e) {
        console.log(e)
    }
});

router.post('/edit', auth, courseValidators, async (req, res) => {
    const {id} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array()[0].msg);
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }
    try {

        delete req.body.id;
        const course = await Course.findByPk(id);
        if (!isOwner(course, req)) {
            return res.redirect('/courses')
        }
        Object.assign(course, req.body);
        await course.save();
        res.redirect('/courses')
    } catch (e) {
        console.log(e);
    }

    if (!isOwner(course, req)) {
        return res.redirect('/courses')
    }

});

router.get('/:id', async (req, res) => {
    const course = await Course.findByPk(req.params.id)
        .catch(err => console.log(err));
    res.render('course', {
        layout: 'empty',
        title: `Курс ${course.title}`,
        course
    })
});

router.post('/remove', auth, async (req, res) => {
    await Course.destroy({
        where: {
            id: req.body.id,
            userId: req.user.id
        }
    }).catch(e => console.log(e));
    res.redirect('/courses')
});

module.exports = router;