const mongoose = require("mongoose");

const wishlightSchema = mongoose.Schema({

    user : {

        type : String,
        required : true

    },
    wishlightedProducts : {

        type : Array,
        required : true

    }

})

const WishlightModel = mongoose.models.Wishlights || mongoose.model('Wishlights', wishlightSchema)
module.exports = WishlightModel