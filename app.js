require('dotenv').config()
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')

const errorController = require('./controllers/error');
const mongoose = require('mongoose')
const User = require('./models/user')

const PORT = process.env.PORT || 3000
const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-mkoaq.mongodb.net/shop`

const app = express();

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})
const csrfProtection = csrf()

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({secret: 'supersecret', resave: false, saveUninitialized: false, store}))

app.use(csrfProtection)
app.use(flash())

app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => console.log(err));
  });

  app.use((req,res,next) => {
      res.locals.isLoggedIn = req.session.isLoggedIn
      res.locals.csrfToken = req.csrfToken()
      next()
  })


app.set('view engine', 'ejs');
app.set('views', 'views');



app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).send('An error ocurred, sorry for any incovenience')
})

try {
    mongoose.connect(MONGODB_URI,{ useNewUrlParser: true })
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    })
} catch (error) {
    console.log(error);
}

