const config = require('config');

module.exports = function (email) {
    return {
        to: email,
        from: config.get('email'),
        subject: 'Аккаунт создан',
        html: `
        <h1>Добро пожаловать в наш магазин</h1>
        <p>Вы успешно создали аккаунт c email - ${email}</p>
        <hr/>
        <a href="${config.get('baseUrl')}">На сайт</a>
        `
    }
};