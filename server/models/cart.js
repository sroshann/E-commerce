const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({

    user : {

        type : String,
        required : true

    },
    cartedProducts : {

        type : Array,
        required : true

    }

})

const CartModel = mongoose.models.Carts || mongoose.model('Cart',cartSchema)
module.exports = CartModel