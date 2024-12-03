var express = require('express');
const ProductModel = require('../models/product');
const { adminAuth } = require('../middleware/authMiddleware');
var router = express.Router();

// ADMIN HOME
router.get('/', adminAuth, async function (req, res, next) {

    try {
        
        const products = await ProductModel.find()
        res.status(200).json( products )

    } catch( error ) { console.error( error ) }

});

// ADD PRODUCTS
router.post('/addproduct', adminAuth, async (request, response, next) => {

    try {

        let schemaObj = new ProductModel({

            name : request.body?.name,
            label : request.body?.label,
            price : request.body?.price,
            description : request.body?.description,
            category : request.body?.category,
            images : request.body?.images,
            quantity : request.body?.quantity   

        })
        
        await schemaObj.save()
        response.status(200).json({ message: 'Product added successfully' })

    } catch (error) {

        console.error('Error occurred while adding the product:', error)
        response.status(500).json({ error: 'Error occurred while adding the product' })

    }

})

module.exports = router;
