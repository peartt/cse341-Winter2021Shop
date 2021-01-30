const path = require('path');
const cors = require('cors');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

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

const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://testman:testman@cluster0.cojzi.mongodb.net/shop?retryWrites=true&w=majority";
                        

const PORT = process.env.PORT || 3000

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const User = require('./models/user');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('6015a6b2c27e571ac0780ac1')
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
.connect( MONGODB_URL, options)
.then(result => {
    User.findOne().then(user => {
        if (!user) {
            const user = new User({
                name: 'Tyler',
                email: 'test@email.com',
                cart: {
                    items: []
                }
            });
            user.save();
        }
    });
    app.listen(PORT);
})
.catch(err => {
    console.log(err);
});

// mongoose.connect('mongodb+srv://testman:testman@cluster0.cojzi.mongodb.net/shop?retryWrites=true&w=majority')
// .then(result => {
//     User.findOne().then(user => {
//         if (!user) {
//             const user = new User({
//                 name: 'Tyler',
//                 email: 'test@email.com',
//                 cart: {
//                     items: []
//                 }
//             });
//             user.save();
//         }
//     });
//     app.listen(3000);
// })
// .catch(err => {
//     console.log(err);
// });
