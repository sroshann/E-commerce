const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    fullname : {

        type : String,
        require : true

    }, 
    username : {

        type : String,
        require : true

    },
    email : {

        type : String,
        require : true

    },
    password : {

        type : String,
        require : true

    },
    confirmpassword : {

        type : String,
        require : true

    }

})

const UserModel = mongoose.model('Users',userSchema)
module.exports = UserModel