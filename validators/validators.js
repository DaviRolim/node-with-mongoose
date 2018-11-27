const { check, body } = require('express-validator/check')

const User = require('../models/user')

exports.signUpValidator = [
  check('email')
 .isEmail()
 .withMessage('Please enter a valid email')
 .custom((value, {req}) => {
    return User.findOne({ email: value }).then(userDoc => {
        if(userDoc) {
            return Promise.reject('Email already exists')
        }
        return true
    })
 }),
 body('password', 'The password should have more than 5 and less than 20 characters.')
 .isLength({min: 5, max:20}),
 body('confirmPassword')
 .custom((value, {req}) => {
     if (value !== req.body.password) {
         throw new Error('Passwords have to match!')
     }
     return true
 })
]

exports.loginValidator = [
    check('email')
    .isEmail()
    .withMessage('Something went wrong, enter a valid email and password'),
    body('password', 'Something went wrong, enter a valid email and password')
    .isLength({min: 5, max:20})
]

exports.addProductValidator = [
    body('title')
    .isLength({ min: 3 })
    .trim(),
    // body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description')
    .isLength({ min: 5, max: 400 })
    .trim()
]