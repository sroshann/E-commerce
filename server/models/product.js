const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    name : {

        type : String,
        required : true

    },
    label : {

        type : String,
        required : true,

    },
    price : {

        type : Number,
        required : true

    },
    description : { 
        
        type : String,
        required : true
    
    },
    category : {

        type : String,
        required : true

    },
    images : { 
        
        type : Array,
        required : true 
    
    },
    quantity : {

        type : Number,
        required : true

    }

})

const ProductModel = mongoose.models.Products || mongoose.model('Products',productSchema)
module.exports = ProductModel