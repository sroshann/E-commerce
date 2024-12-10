var express = require('express');
const ProductModel = require('../models/product');
const CartModel = require('../models/cart');
const { userAuth } = require('../middleware/authMiddleware');
const WishlightModel = require('../models/wishlights');
var router = express.Router();

// GET home page
router.get('/', async function (request, response, next) {

    try{

        const aggregatedProducts = await ProductModel.aggregate([
            
            {

                $group : { 
                    
                    _id : "$category",
                    products : { $push : "$$ROOT" } // Include the complete document in the grouped results
                
                }

            }
    
        ])
        response.status( 200 ).json( aggregatedProducts )

    } catch ( error ) { response.status(500).json({ error: 'Error occurred while fetching product' }) }

});

// Add to cart
router.post('/addToCart', userAuth, async ( request, response, next ) => {

    try {

        const { userId, productId } = request.body
        const productObject = {

            productId : productId,
            count : 1

        }

        const userCart = await CartModel.findOne({ user : userId })
        let resultResponse
        if( userCart ) {

            // Checking whether the product is already exist in the user cart list
            const productAlreadyCarted = userCart.cartedProducts.findIndex( item => item.productId === productId )
            if ( productAlreadyCarted !== -1 ) return response.status(200).json({ warning : 'Product already added to cart' }) 
            else {
        
                // Update the existing cart 
                resultResponse = await CartModel.updateOne( 
                    
                    { user : userId }, 
                    { $push : { cartedProducts : productObject } }
                
                )
        
            }
            
        } else {

            // Create a new cart for the user
            let schemaObj = new CartModel({

                user : userId,
                cartedProducts : productObject

            })
            resultResponse = await schemaObj.save()

        }

        response.status( 200 ).json({ message : 'Product added to cart' })

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured adding the product to cart' }) }

})

// Get carted products
router.get('/getCartedProducts/:userId', userAuth, async ( request, response, next ) => {

    try {

        const { userId } = request.params
        const cartedProducts = await CartModel.aggregate([

            { $match : { user : userId } },
            { $unwind : '$cartedProducts' },
            { $project : {

                productId : { $toObjectId: '$cartedProducts.productId' },
                count : '$cartedProducts.count'

            }},
            { $lookup : {

                from : 'products',
                localField : 'productId',
                foreignField : '_id',
                as : 'productDetails'
                
            }},
            { $project : {

                count : 1,
                productDetails : 1

            }},
            {
                $group: {
                  _id: '$productId', // Group by productId
                  productDetails: {
                    $push: {
                      $mergeObjects: [
                        { $arrayElemAt: ['$productDetails', 0] }, // Extract product details object
                        { count: '$count' }, // Add quantity
                      ],
                    },
                  },
                },
            }

        ])
        if( cartedProducts.length === 0 || cartedProducts[0].productDetails.length === 0) 
            return response.status( 200 ).json({ warning : 'Cart is empty' })
        else {
            
            let cartedItems = cartedProducts[0].productDetails // Aggregation always return an array
            // Calculating the total price of cart
            // 0 is the inintial value of sum
            const totalAmount = cartedItems.reduce( ( sum, item ) => sum + ( item.price * item.count ), 0 ) 
            response.status( 200 ).json({ message : cartedItems, totalAmount })
    
        }

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while getting carted products' }) }

})

// Get carted products ids
router.get('/getCartedProductsIds/:userId', userAuth, async ( request, response, next ) => {

    try {

        const { userId } = request.params
        const userCart = await CartModel.findOne({ user : userId })
        if( userCart ) {

            response.status( 200 ).json({ message : userCart.cartedProducts })

        }
        else response.status( 200 ).json({ warning : 'Cart is empty' })

    } catch( error ) { response.status( 500 ).json({ error : 'Error occured while getting carted products ids' }) }
    
})

// Change carted products count
router.put('/changeProductCount', userAuth, async ( request, response, next ) => {

    try {

        const { userId, productId, increment } = request.body
        console.log( request.body )
        // This query fetches quantity of the product form 'products' collection and 
        // the current count stored in 'cart' collection
        const cartData = await CartModel.aggregate([

            { $match: { user: userId } },
            { $unwind: '$cartedProducts' },
            { $match: { 'cartedProducts.productId': productId } },
            {

                $addFields: {
                    productObjectId: { $toObjectId: '$cartedProducts.productId' } // Convert productId to ObjectId
                }

            },
            {

                $lookup: {
                    from: 'products', // Replace with your actual product collection name
                    localField: 'productObjectId',
                    foreignField: '_id',
                    as: 'productDetails'
                }

            },
            { $unwind: '$productDetails' },
            {

                $project: {

                    'cartedProducts.count': 1,
                    'productDetails.quantity': 1

                }

            }

        ])

        const currentCartCount = cartData[0].cartedProducts.count;
        const currentStock = cartData[0].productDetails.quantity;

        // Checking whether the item count exceeds current stock quantity
        if( currentCartCount + increment > currentStock ) 
            return response.status( 200 ).json({ warning : 'Item count exceeded current stock quantity' })
        // Checking whether the product quantity becomes 0
        else if ( currentCartCount + increment === 0 )
            return response.status( 200 ).json({ warning : 'Item count reached minimum quanitity' })
        else {

            // Increment the product count
            const updateResponse = await CartModel.updateOne(

                { 
                    
                    user : userId,
                    'cartedProducts.productId': productId 
                
                },
                { $inc : { 'cartedProducts.$.count' : increment } }
    
            )
            if( updateResponse.modifiedCount === 0 ) response.status( 200 ).json({ warning : 'Product not found in cart' })
            else response.status( 200 ).json({ message : 'Count updated successfully' })

        }

    } catch ( error ) { response.status(500).json({ error : 'Error occured while changing the count' }) }

})

// Add to wishlights
router.post('/addToWishlights', userAuth, async ( request, response, next ) => {

    try {

        const { userId, productId } = request.body
        // Checking the user has already wishlights,
        // If it exist update the existing one otherwise create a new one
        const userWishlight = await WishlightModel.findOne({ user : userId })
        if( userWishlight ) {

            // Checking whether the product is already added to list of wishlights
            const alreadyAdded = userWishlight.wishlightedProducts.includes( productId )
            if( alreadyAdded ) return response.status(200).json({ warning : 'Products already added to wishlights' })
            else {
        
                // Update the existing wishlight
                await WishlightModel.updateOne(

                    { user : userId },
                    { $push : { wishlightedProducts : productId } }

                )

            }

        } else {

            // Creating a new wishlight for the user
            const schemaObj = new WishlightModel({

                user : userId,
                wishlightedProducts : productId

            })
            await schemaObj.save()

        }
        response.status( 200 ).json({ message : 'Product added to wishlights' })

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while adding the product to wishlights' }) }

})

// Get wishlighted products
router.get('/getWishlightedProducts/:userId', userAuth, async ( request, response, next ) => {

    try {

        const { userId } = request.params
        const wishlightedProducts = await WishlightModel.aggregate([

            { $match : { user : userId } },
            {

                $lookup : {

                    from : 'products', // collection name which is to be joined
                    let : { prdctLstOfWshlghts : '$wishlightedProducts' }, // storing the carted product array into a variable,
                    pipeline : [{

                        $match : {

                            $expr : {

                                $in : [

                                    '$_id',
                                    {

                                        $map : {

                                            // Iterates over each value in $$prdctLstOfWshlghts (the carted products array).
                                            // Converts each string (productId) into an ObjectId using $toObjectId.
                                            // the product ids are stored in cart collection as string format 
                                            input: '$$prdctLstOfWshlghts', 
                                            as: 'productId', 
                                            in: { $toObjectId: '$$productId' } 

                                        }

                                    }

                                ]

                            }

                        }

                    }],
                    as : 'wishlightedItems'

                }

            }

        ])
        console.log('Wishlighted products = ',wishlightedProducts)
        if ( wishlightedProducts.length === 0 || wishlightedProducts[0].wishlightedProducts.length === 0 ) 
            return response.status(200).json({ warning : 'Wishlight is empty' })
        else {
    
            // Aggregation always return an array
            let wishlightedData = wishlightedProducts[0].wishlightedItems
            response.status( 200 ).json({ message : wishlightedData })

        }

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while getting wishlighted products' }) }

})

// Get wishlighted products ids
router.get('/getWishlightedProductsIds/:userId', userAuth, async ( request, response, next ) => {

    try {

        const { userId } = request.params
        const userWishlight = await WishlightModel.findOne({ user : userId })
        if( userWishlight ) response.status( 200 ).json({ message : userWishlight.wishlightedProducts })
        else response.status( 200 ).json({ warning : 'Wishlight is empty' })

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while getting wishlighted product ids' }) }

})

// To remove product from cart and wishlights
router.delete('/removeProduct/:option/:userId/:productId', userAuth, async ( request, response, next ) => {

    try {

        const { option, userId, productId } = request.params
        if( option === 'cart' ) {

            // This query will direclty remove the product id from the document array
            const updateResponse = await CartModel.updateOne(

                { user: userId },
                { $pull: { cartedProducts: { productId : productId } } } // Removes the product directly

            )
            if( updateResponse.modifiedCount === 0 ) return response.status(200).json({ warning : 'Product not found in cart' })

        } else if ( option === 'wishlight' ) {

            const updateResponse = await WishlightModel.updateOne(

                { user : userId },
                { $pull : { wishlightedProducts : productId } }

            )
            if( updateResponse.modifiedCount === 0 ) return response.status(200).json({ warning : 'Product not found in wishlight' })

        }

        response.status( 200 ).json({ message : `Product removed from ${ option }` })

    } catch ( error ) { response.status(500).json({ error : 'Error occured while removing the product' }) }

})

module.exports = router;
