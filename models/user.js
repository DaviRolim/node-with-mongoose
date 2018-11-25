const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [{productId: {type: Schema.Types.ObjectId, required: true, ref: 'Product'},
             quantity: {type: Number, required: true} 
            }
           ]
  }
})

userSchema.methods.addToCart = function(product) {
  try {
    const cartProductIndex = this.cart.items.findIndex(cp => cp.productId.toString() === product._id.toString())
    let newQuantity = 1
    const updatedCartItems = [...this.cart.items]

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1
      updatedCartItems[cartProductIndex].quantity = newQuantity
    } else {
      updatedCartItems.push({productId: product._id, quantity: newQuantity})
    }
    const updatedCart = {items: updatedCartItems}
    this.cart = updatedCart
    this.save()
  } catch (error) {
    console.log(error);
  }
}

userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(i => {
    return i.productId.toString() !== productId.toString()
  })
  this.cart.items = updatedCartItems
  this.save()
}

userSchema.methods.clearCart = async function() {
  this.cart = { items: []}
  this.save()
}
module.exports = mongoose.model('User', userSchema)

// const mongodb = require('mongodb')
// const {getDb} = require('../util/database')

// const ObjectId = mongodb.ObjectId

// class User {
//   constructor(username, email, cart, id) {
//     this.name = username
//     this.email = email
//     this.cart = cart
//     this._id = new ObjectId(id)
//   }

//   async save() {
//     const db = getDb()
//     try {
//       await db.collection('users').insertOne(this)
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   async addToCart(product) {
//     const db = getDb()
//     try {
//       const cartProductIndex = this.cart.items.findIndex(cp => cp.productId.toString() === product._id.toString())
//       let newQuantity = 1
//       const updatedCartItems = [...this.cart.items]

//       if (cartProductIndex >= 0) {
//         newQuantity = this.cart.items[cartProductIndex].quantity + 1
//         updatedCartItems[cartProductIndex].quantity = newQuantity
//       } else {
//         updatedCartItems.push({productId: new ObjectId(product._id), quantity: newQuantity})
//       }
//       const updatedCart = {items: updatedCartItems}
//       await db.collection('users').updateOne(
//         {_id: this._id},
//         {$set: {cart: updatedCart} }
//       )
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   async getCart() {
//     const db = getDb()
//     const productsIds = this.cart.items.map(i => i.productId)
//     const products = await db.collection('products').find({_id: {$in: productsIds}}).toArray()
//     return products.map(p => {
//       return {...p, quantity: this.cart.items.find(i => {
//         return i.productId.toString() === p._id.toString()
//       }).quantity}
//     })
//   }

//   async addOrder() {
//     const db = getDb()
//     try {
//       const cartProducts = await this.getCart()
//       const order = {
//         items: cartProducts,
//         user: {
//           _id: this._id,
//           name: this.name
//         }
//       }
//       await db.collection('orders').insertOne(order)
//       this.cart = {items: []}
//       await db.collection('users').updateOne(
//         {_id: this._id},
//         {$set: {cart: {items: [] } } }
//       ) 
//     } catch (error) {
//       console.log(error);
//     }

//   }

//   async getOrders() {
//     const db = getDb()
//     const orders = await db.collection('orders').find({'user._id': this._id}).toArray()
//     return orders
//   }

//   async deleteItemFromCart(id) {
//     const db = getDb()
//     try {
//       const updatedCartItems = this.cart.items.filter(i => {
//         return i.productId.toString() !== id.toString()
//       })
//       await db.collection('users').updateOne(
//         {_id: this._id},
//         {$set: {cart: {items: updatedCartItems}} }
//       )
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   static async findById(id) {
//     const db = getDb()
//     try {
//       const user = await db.collection('users').findOne({_id: new ObjectId(id)})
//       return user
//     } catch (error) {
//       console.log(error);
//     }
//   }
// }

// module.exports = User