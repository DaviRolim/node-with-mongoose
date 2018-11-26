const Product = require('../models/product')
const { validationResult } = require('express-validator/check');


exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  })
}

exports.postAddProduct = async (req, res, next) => {
  try {
    const title = req.body.title
    const imageUrl = req.body.imageUrl
    const price = req.body.price
    const description = req.body.description
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        product: {
          title,
          imageUrl,
          price,
          description
        }
      })
    }
    const userId = req.session.user._id
    const product = new Product({title, price, description, imageUrl, userId})
    await product.save()
    res.redirect('/admin/products')
  } catch (error) {
    console.log(error)
  }
}

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit
  if (!editMode) {
    return res.redirect('/')
  }
  try {
    const prodId = req.params.productId
    const product = await Product.findById(prodId)
    if (!product) {
      return res.redirect('/')
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product
    })
  } catch (error) {
    console.log(error)
  }
}

exports.postEditProduct = async (req, res, next) => {
  const prodId = req.body.productId
  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const updatedImageUrl = req.body.imageUrl
  const updatedDesc = req.body.description
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc
      }
    })
  }
  try {
    const product = await Product.findById(prodId)
    if (product.userId !== req.user._id) {
      return res.redirect('/')
    }
    product.title = updatedTitle
    product.price = updatedPrice
    product.imageUrl = updatedImageUrl
    product.description = updatedDesc
    await product.save()
    res.redirect('/admin/products')
  } catch (error) {
    console.log(error)
  }
}

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({userId: req.user._id})
     //.select('title price -_id')
     //.populate('userId', 'name')
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    })
  } catch (error) {
    console.log(error)
  }
}

exports.postDeleteProduct =  async (req, res, next) => {
  const prodId = req.body.productId
  await Product.deleteOne({_id: prodId, userId: req.user._id.toString()})
  res.redirect('/admin/products')
}
