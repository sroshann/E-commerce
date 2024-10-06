const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    name : {

        type : String,
        required : true

    },
    price : {

        type : Number,
        required : true

    },
    description : { type : String },
    category : {

        type : String,
        required : true

    },
    image : { 
        
        type : String,
        required : true 
    
    }

})

const ProductModel = mongoose.model('Products',productSchema)
module.exports = ProductModel