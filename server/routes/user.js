var express = require('express');
const ProductModel = require('../models/product');
var router = express.Router();

/* GET home page. */
router.get('/', async function (request, response, next) {

    try{

        const products = await ProductModel.find()
        const user = request.session.user
        console.log( 'User details from session = ', user )
        response.status( 200 ).json( products )

    } catch ( error ) { 
        
        console.error( error ) 
        response.status(500).json({ error: 'Error occurred while fetching product' })
    
    }

});

module.exports = router;
