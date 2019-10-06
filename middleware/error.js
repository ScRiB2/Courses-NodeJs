module.exports = function (req, res, next) {
    res.set(404).render('404', {
        title: 'Странциа не найдена'
    })
};