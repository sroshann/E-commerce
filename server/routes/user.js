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
        console.log("Aggregated Products = ",aggregatedProducts)

        // const products = await ProductModel.find()
        response.status( 200 ).json( aggregatedProducts )

    } catch ( error ) { 
        
        console.log(error)
        response.status(500).json({ error: 'Error occurred while fetching product' }) 
    
    }

});

// Add to cart
router.post('/addToCart', userAuth, async ( request, response, next ) => {

    try {

        const { userId, productId } = request.body
        const userCart = await CartModel.findOne({ user : userId })
        let resultResponse
        if( userCart ) {

            // Checking whether the product is already exist in the user cart list
            const productAlreadyCarted = userCart.cartedProducts.includes( productId )
            if (productAlreadyCarted) return response.status(200).json({ warning : 'Product already added to cart' }) 
            else {
        
                // Update the existing cart 
                resultResponse = await CartModel.updateOne( 
                    
                    { user : userId }, 
                    { $push : { cartedProducts : productId } }
                
                )
        
            }
            
        } else {

            // Create a new cart for the user
            let schemaObj = new CartModel({

                user : userId,
                cartedProducts : productId

            })
            resultResponse = await schemaObj.save()

        }

        console.log( 'Cart response = ', resultResponse )
        response.status( 200 ).json({ message : 'Product added to cart' })

    } catch ( error ) {

        console.log( error )
        response.status( 500 ).json({ error : 'Error occured adding the product to cart' })

    }

})

// Get carted products
router.get('/getCartedProducts/:userId', userAuth, async ( request, response, next ) => {

    try {

        const { userId } = request.params
        const cartedProducts = await CartModel.aggregate([

            { $match : { user : userId } },
            {

                $lookup : {

                    from : 'products', // collection name which is to be joined
                    let : { productListOfCart : '$cartedProducts' }, // storing the carted product array into a variable,
                    pipeline : [{ 
                            
                        $match : {

                            $expr : {

                                $in: [
                                    
                                    '$_id', 
                                    { 
                                        
                                        $map: { 
                                            
                                            // Iterates over each value in $$productListOfCart (the carted products array).
                                            // Converts each string (productId) into an ObjectId using $toObjectId.
                                            // the product ids are stored in cart collection as string format 
                                            input: '$$productListOfCart', 
                                            as: 'productId', 
                                            in: { $toObjectId: '$$productId' } 
                                        
                                        } 
                                    
                                    }
                                
                                ]

                            }

                        } 
                        
                    }],
                    as : 'cartedItems'

                }

            }

        ])
        if( cartedProducts.length === 0 ) return response.status( 200 ).json({ warning : 'Cart is empty' })
        else {
        
            // Aggregation always return an array
            let cartedItems = cartedProducts[0].cartedItems 
            response.status( 200 ).json({ message : cartedItems })
    
        }

    } catch ( error ) {

        console.log( error )
        response.status( 500 ).json({ error : 'Error occured while getting carted products' })

    }

})

// Get carted products ids
router.get('/getCartedProductsIds/:userId', userAuth, async ( request, response, next ) => {

    try {

        const { userId } = request.params
        const userCart = await CartModel.findOne({ user : userId })
        if( userCart ) response.status( 200 ).json({ message : userCart.cartedProducts })
        else response.status( 200 ).json({ warning : 'Cart is empty' })

    } catch( error ) {

        console.log(error)
        response.status( 500 ).json({ error : 'Error occured while getting carted products ids' })

    }
    
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
        if ( wishlightedProducts.length === 0 ) return response.status(200).json({ warning : 'Wishlight is empty' })
        else {
    
            // Aggregation always return an array
            let wishlightedData = wishlightedProducts[0].wishlightedItems
            response.status( 200 ).json({ message : wishlightedData })

        }

    } catch ( error ) {

        console.log( error )
        response.status( 500 ).json({ error : 'Error occured while getting wishlighted products' })

    }

})

// Get wishlighted products ids
router.get('/getWishlightedProductsIds/:userId', userAuth, async ( request, response, next ) => {

    try {

        const { userId } = request.params
        const userWishlight = await WishlightModel.findOne({ user : userId })
        if( userWishlight ) response.status( 200 ).json({ message : userWishlight.wishlightedProducts })
        else response.status( 200 ).json({ warning : 'Wishlight is empty' })

    } catch ( error ) {

        console.log( error )
        response.status( 500 ).json({ error : 'Error occured while getting wishlighted product ids' })

    }

})

module.exports = router;
