const bcrypt = require('bcryptjs')

const User = require('../models/user')

exports.getLogin = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const user = await User.findOne({email})
  if (!user) {
    req.flash('error', 'Invalid email or password')
    return res.redirect('/login')
  }
  const doMatch = await bcrypt.compare(password, user.password)
  if (doMatch) {
    req.session.user = user
    req.session.isLoggedIn = true
    await req.session.save()
    return res.redirect('/')
  }
  req.flash('error', 'Invalid email or password')
  return res.redirect('/login')
}

exports.postLogout = async (req, res, next) => {
  req.session.destroy(err => {
    res.redirect('/')
  })
}

exports.getSignup = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

exports.postSignup = async (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword
  const userExists = await User.findOne({email})
  if(!userExists) {
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User( {email, password: hashedPassword, cart: { items:[] } } )
    await user.save()
    return res.redirect('/login')
  }
  req.flash('error', 'Email already exists')
  return res.redirect('/signup')
};
