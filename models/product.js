const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

module.exports = mongoose.model('Product', productSchema)

// const mongodb = require('mongodb')
// const {getDb} = require('../util/database')

// const ObjectId = mongodb.ObjectId

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title
//     this.price = price
//     this.description = description
//     this.imageUrl = imageUrl
//     this._id = id ? new ObjectId(id) : null
//     this.userId = userId
//   }

//   async save() {
//     const db = getDb()
//     if (this._id) {
//       await db.collection('products').updateOne({_id: new ObjectId(this._id)}, {$set: this})
//     } else {
//       await db.collection('products').insertOne(this)
//     }
//   }

//   static async findAll() {
//     const db = getDb()
//     const products = await db.collection('products').find().toArray()
//     return products
//   }

//   static async findById(id) {
//     const db = getDb()
//     const product = await db.collection('products').find({_id: new ObjectId(id)}).next()
//     return product
//   }

//   static async deleteById(id) {
//     const db = getDb()
//     try {
//       await db.collection('products').deleteOne({_id: new ObjectId(id)})
//       console.log('Deleted');
//     } catch (error) {
//       console.log(error);
//     }
//   }

// }

// module.exports = Product