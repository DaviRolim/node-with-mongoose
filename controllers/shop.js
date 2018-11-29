const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit')

const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const prodId = req.params.productId;
    const product = await Product.findById(prodId)
    if (!product) {
      return res.redirect('/')
    }
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user =  await req.user.populate('cart.items.productId').execPopulate()
    const products = user.cart.items
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products
    });
  } catch (error) {
    console.log(error);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const product = await Product.findById(prodId)
    await req.user.addToCart(product)
    res.redirect('/cart')
    } catch (error) {
      console.log(error);
    }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    await req.user.removeFromCart(prodId)
    res.redirect('/cart')
  } catch (error) {
    console.log(error);
  }
};

exports.getOrders = async (req, res, next) => {
  const orders =  await Order.find({ 'user.userId': req.session.user._id })
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders',
    orders
  });
};

exports.postOrder = async (req, res, next) => {
  const user =  await req.user.populate('cart.items.productId').execPopulate()
  const products = user.cart.items.map(i => {
    return {quantity: i.quantity, product: { ...i.productId._doc} }
  })
  const order = new Order({
    user: {
      email: req.user.email,
      userId: req.session.user //mongoose get only the id from the user Object... so smart!
    },
    products
  })
  await order.save()
  await req.user.clearCart()
  res.redirect('/orders')
}

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'))
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'))
      }
      const invoiceName = 'invoice-' + orderId + '.pdf'
      const invoicePath = path.join('data', 'invoices', invoiceName)
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      )
      const pdfDoc = new PDFDocument()
      pdfDoc.pipe(fs.createWriteStream(invoicePath))
      pdfDoc.pipe(res)
      pdfDoc.fontSize(26).text('Invoice', {underline: true})
      pdfDoc.text('-----------------------------')
      let totalPrice = 0
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price
        pdfDoc.fontSize(15).text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price)
      })
      pdfDoc.text('-----------------------------')
      pdfDoc.fontSize(20).text('Total price $' + totalPrice)
      pdfDoc.end()
    })
    .catch(err => next(err))
}