const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({

    createdAt : {

        type : Date,
        require : true

    },
    user : {

        type : String,
        require : true

    },
    phoneNumber : {

        type : Number,
        require : true

    },
    email : {

        type : String,
        require : true

    },
    address : {

        type : Object,
        require : true

    },
    paymethodMethod : {

        type : String,
        require : true

    },
    products : {

        type : Array,
        require : true

    },
    amountToPay : {

        type : Number,
        require : true

    },
    status : {

        type : String,
        require : true

    }

})

const OrderModel = mongoose.models.Orders || mongoose.model('Orders',orderSchema)
module.exports = OrderModel