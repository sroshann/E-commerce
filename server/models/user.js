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
    phoneNumber : {

        type : String,
        require : true

    },
    address : { type : Array },
    password : {

        type : String,
        require : true

    },
    profileImage : { type : String, },
    isAdmin : { type : Boolean },
    googleId : { type : String }

})

const UserModel = mongoose.model.Users || mongoose.model('Users',userSchema)
module.exports = UserModel