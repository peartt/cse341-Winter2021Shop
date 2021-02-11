const path = require('path');
const cors = require('cors');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://testman:testman@cluster0.cojzi.mongodb.net/shop?w=majority";

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URL,
    collection: 'sessions',   
});

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views'); //This is the default expression
const corsOptions = {
    origin: "https://cs341-winter2021shop.herokuapp.com/",
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    family: 4
};

const PORT = process.env.PORT || 3000

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'SECRET CODE',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use(csrfProtection);
app.use(flash())

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        if (!user) {
            return next();
        }
        req.user = user;
        next();
    })
    .catch(err => {
        next(new Error(err));
    });
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    res.redirect('/500');
})

mongoose
.connect( MONGODB_URL, options)
.then(result => {
    app.listen(PORT);
})
.catch(err => {
    console.log(err);
});
