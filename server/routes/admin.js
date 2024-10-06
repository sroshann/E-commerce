var express = require('express');
const ProductModel = require('../models/product');
var router = express.Router();

router.get('/', async function (req, res, next) {

    try {
        
        const products = await ProductModel.find()
        res.status(200).json( products )

    } catch( error ) { console.error( error ) }

});

router.post('/addproduct', async (request, response, next) => {

    try {

        let schemaObj = new ProductModel({

            name : request.body?.name,
            price : request.body?.price,
            description : request.body?.description,
            category : request.body?.category,
            image : request.body?.image   

        })
        
        await schemaObj.save()
        response.status(200).json({ message: 'Product added successfully' })

    } catch (error) {

        console.error('Error occurred while adding the product:', error)
        response.status(500).json({ error: 'Error occurred while adding the product' })

    }

})

module.exports = router;
