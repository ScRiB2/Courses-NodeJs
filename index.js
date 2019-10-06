const config = require('config');
const express = require('express');
const path = require('path');
const sequelize = require('./utils/database');
const exphbs = require('express-handlebars');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const csrf = require('csurf');
const flash = require('connect-flash');

const User = require('./models/user');
const Cart = require('./models/seq-cart');
const Course = require("./models/seq-course");
const CartCourse = require("./models/cart-course");
const Order = require("./models/order");
const OrderCourse = require("./models/order-course");

const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const cardRoutes = require('./routes/card');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const fileMiddleware = require('./middleware/file');
const errorHandler = require('./middleware/error');

const app = express();

if (!config.get('jwtPrivateKey')) {
    console.error("FATAL ERROR: jwtPrivateKey is not defined.");
    process.exit(1);
}

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require('./utils/hbs-helpers')
});

const store = new SequelizeStore({
    db: sequelize
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: config.get('sessionSecretKey'),
    resave: false,
    saveUninitialized: false,
    store
}));
app.use(fileMiddleware.single('avatar'));
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/card", cardRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

app.use(errorHandler);

Course.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Course);
User.hasOne(Cart, {onDelete: "cascade"});
Cart.belongsTo(User);
Cart.belongsToMany(Course, {through: CartCourse});
Course.belongsToMany(Cart, {through: CartCourse});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Course, {through: OrderCourse});

const PORT = process.env.PORT || 3000;

async function start() {
    sequelize
    // .sync({force: true})
        .sync()
        .then(result => {
            console.log('Синхронизация прошла успешно');
            app.listen(PORT, () => console.log(`Сервер запустился на порту ${PORT}`));
        })
        .catch(err => console.log(err));
}

start();

