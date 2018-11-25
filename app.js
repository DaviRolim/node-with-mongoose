const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()

const errorController = require('./controllers/error');
const mongoose = require('mongoose')
const User = require('./models/user')

const app = express();

const PORT = process.env.PORT || 3000

app.set('view engine', 'ejs');
app.set('views', 'views');


const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use( async (req,res,next) => {
    try {
        const user = await User.findById('5bf9c2696fd0894cb01d4587')
        req.user = user
        next()
    } catch (error) {
        console.log(error);
    }
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

try {
    mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-mkoaq.mongodb.net/shop?retryWrites=true`,{ useNewUrlParser: true })
    User.findOne().then(user => {
        if(!user) {
            const user = new User({
                name: 'Davi',
                email: 'davirolim94@gmail.com',
                cart: {
                    items: []
                }
            })
            user.save()
        }
    })
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    })
} catch (error) {
    console.log(error);
}

