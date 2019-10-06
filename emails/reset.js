const config = require('config');

module.exports = function (email, token) {
    return {
        to: email,
        from: config.get('email'),
        subject: 'Восстановление пароля',
        html: `
        <h1>Забыли пароль?</h1>
        <p>Если нет, то проигнорируйте письмо</p>
        <p>Иначе нажмите на ссылку ниже:</p>
        <p><a href="${config.get('baseUrl')}/auth/password/${token}">Восстановить доступ</a></p>
        <hr/>
        <a href="${config.get('baseUrl')}">На сайт</a>
        `
    }
};