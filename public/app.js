const toCurrency = price => {
    return new Intl.NumberFormat('ru-RU', {
            currency: 'rub',
            style: 'currency'
        }
    ).format(price)
};

const toDate = date => {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(date))
};

document.querySelectorAll('.price').forEach(node => {
    node.textContent = toCurrency(node.textContent)
});

document.querySelectorAll('.date').forEach(node => {
    node.textContent = toDate(node.textContent)
});

const $card = document.querySelector('#card');
if ($card) {
    $card.addEventListener('click', event => {
        if (event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id;
            const csrf = event.target.dataset.csrf;
            console.log(csrf);

            fetch('/card/remove/' + id, {
                method: 'delete',
                headers: {
                    "X-CSRF-TOKEN": csrf
                }
            }).then(res => res.json())
                .then(cart => {
                    if (cart.courses.length) {
                        const html = cart.courses.map(c => {
                            return `
                            <tr>
                                <td>${c.title}</td>
                                <td>${c.cartCourse.count}</td>
                                <td>
                                    <button class="btn btn-small js-remove" data-id="${c.id}">Удалить</button>
                                </td>
                            </tr>
                            `
                        }).join('');
                        $card.querySelector('tbody').innerHTML = html;
                        $card.querySelector('.price').innerHTML = toCurrency(cart.price);
                    } else {
                        $card.innerHTML = '<p>Корзина пуста</p>'
                    }
                })
        }
    })
}

M.Tabs.init(document.querySelectorAll('.tabs'));