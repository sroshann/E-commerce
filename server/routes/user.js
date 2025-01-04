var express = require('express');
const ProductModel = require('../models/product');
const CartModel = require('../models/cart');
const { userAuth } = require('../middleware/authMiddleware');
const WishlightModel = require('../models/wishlights');
const OrderModel = require('../models/order')
const userHelperFunctions = require('../helpers/userHelper');
const UserModel = require('../models/user');
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
        if( userCart ) {

            // Checking whether the product is already exist in the user cart list
            const productAlreadyCarted = userCart.cartedProducts.findIndex( item => item.productId === productId )
            if ( productAlreadyCarted !== -1 ) return response.status(200).json({ warning : 'Product already added to cart' }) 
            else {
        
                // Update the existing cart 
                await CartModel.updateOne( 
                    
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
            await schemaObj.save()

        }

        response.status( 200 ).json({ message : 'Product added to cart' })

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured adding the product to cart' }) }

})

// Get carted products
router.get('/getCartedProducts/:userId', userAuth, async ( request, response, next ) => {

    try {

        const { userId } = request.params
        const cartedProducts = await userHelperFunctions.getCartedProducts( userId ) // This function is used to get carted products
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
        if( userCart ) response.status( 200 ).json({ message : userCart.cartedProducts })
        else response.status( 200 ).json({ warning : 'Cart is empty' })

    } catch( error ) { response.status( 500 ).json({ error : 'Error occured while getting carted products ids' }) }
    
})

// Change carted products count
router.put('/changeProductCount', userAuth, async ( request, response, next ) => {

    try {

        const { userId, productId, increment } = request.body

        // Function used to get quantity of product form 'products' collection and 
        // the current count stored in 'cart' collection
        const cartData = await userHelperFunctions.getCartedCountAndProductQuantity( userId, productId )
        const currentCartCount = cartData[0].cartedProducts.count;
        const currentStock = cartData[0].productDetails.quantity;

        if( currentCartCount + increment > currentStock ) // Checking whether the item count exceeds current stock quantity
            return response.status( 200 ).json({ warning : 'Item count exceeded current stock quantity' })
        else if ( currentCartCount + increment === 0 ) // Checking whether the product quantity becomes 0
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
            if( alreadyAdded ) return response.status(200).json({ warning : 'Product already added to wishlights' })
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
        // Function used to get wishlighted products
        const wishlightedProducts = await userHelperFunctions.getWishlightedProducts( userId ) 
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

// Remove product from cart and wishlights
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

// Get checkout order data
router.get('/getCheckOutOrderData/:userId/:option/:productId', userAuth, async ( request, response, next ) => {

    try {

        let productData
        let productsPrice
        const { userId, option, productId } = request.params

        // Getting user details
        const user = await UserModel.findOne({ _id : userId })
        const userDetails = { phoneNumber : user.phoneNumber, email : user.email, address : user.address }

        // Getting product details
        if( option === 'cart' ) {

            const cartData = await userHelperFunctions.getCartedProducts( userId ) // Function used to get cart data
            productData = cartData[0].productDetails
            productsPrice = productData.reduce( ( sum, item ) => sum + ( item.count * item.price ), 0 )

        }
        else {

            productData = await ProductModel.findOne({ _id : productId })
            productData = { ...productData._doc, count: 1 } // Setting up the count of product as 1
            productsPrice = productData.price
            productData = [ productData ] // Check out order component render products as arrays

        }

        response.status( 200 ).json({ userDetails, productData, productsPrice })

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while getting checkout data' }) }

})

// Place order
router.post('/placeOrder', userAuth, async ( request, response, next ) => {

    try {

        let productData, productsPrice
        // The address can be taken from user db, but if the user is given an address
        // which is not available in user db, so it must be passed as parameters
        const { address, userId, option, productId, paymentType } = request.body

        // Getting user details
        const user = await UserModel.findOne({ _id : userId })
        const { email, phoneNumber } = user

        // Getting product details
        if( option === 'cart' ) {

            const cartData = await userHelperFunctions.getCartedProducts( userId ) // Function used to get cart data
            productsPrice = cartData[0].productDetails.reduce( ( sum, item ) => sum + ( item.count * item.price ), 0 )
            const cartedIds = await CartModel.findOne({ user : userId })
            productData = cartedIds.cartedProducts 

        }
        else {

            const product = await ProductModel.findOne({ _id : productId })
            productData = { productId : product._id, count : 1 } // The product details are stored as array of objects in db
            productsPrice = product.price

        }

        // 3 represents platform fee and 40 represents delivery charge
        // If the product price is greater 200 delivery charge will be FREE otherwise 40Rs is charged
        const schemaObj = new OrderModel({

            createdAt : new Date(),
            user : userId,
            phoneNumber,
            email,
            address,
            paymentMethod : paymentType,
            products : productData,
            amountToPay : productsPrice > 200 ? productsPrice + 3 : productsPrice + 43,
            status : paymentType === 'COD' ? 'placed' : 'pending'

        })

        await schemaObj.save().then( async ( saveResponse ) => {

            // When the order is placed, the product should removed from the cart
            // If the option is cart directly delete the cart object
            // Else update the cart collection on removing only the ordered product from carted products
            // Also on placing order the quantity of the curresponding product should be decreased
            // If the quantity becomes 0 it must be deleted
            if( option === 'cart' ) {

                const updatePromises = productData.map( async (item) => {

                    await ProductModel.updateOne(

                        { _id: item.productId },
                        { $inc: { quantity: -item.count } }

                    )
                    const product = await ProductModel.findOne({ _id : item.productId })
                    if (product && product.quantity <= 0) await ProductModel.deleteOne({ _id: item.productId })

                })
            
                // Wait for all updates to complete
                await Promise.all(updatePromises);
                await CartModel.deleteOne({ user : userId }) // Deleting the cart collection

            }
            else {
        
                // Need to handle this situation
                await CartModel.updateOne(

                    { user: userId },
                    { $pull: { cartedProducts: { productId : productId } } } // Removes the product directly
    
                )
                
            }

            response.status( 200 ).json({ 

                message : 'Order placed successfully', 
                orderId: saveResponse._id, 
                status: saveResponse.orderStatus
            
            })
                      
        })     
        
    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while placing order' }) }
    
})

// Get ordereded products
router.get('/getOrderedProducts/:userId', userAuth, async ( request, response, next ) => {

    try {

        const { userId } = request.params
        const orderDetails = await userHelperFunctions.getOrderedProducts( userId )
        if( orderDetails.length > 0 ) response.status( 200 ).json({ orders : orderDetails[0].productDetails })
        else response.status(200).json({ warning : 'No orders are placed yet' })

    } catch ( error ) { response.status(500).json({ error : 'Error occured on getting ordered products' }) }

})

// Get ordered details
router.get('/getOrderDetails/:orderId', userAuth, async( request, response, next ) => {

    try{

        const { orderId } = request.params 
        const orderData = await OrderModel.findOne({ _id : orderId }) // Getting order details
        const { products, ...rest } = orderData._doc
        const orderedProducts = await userHelperFunctions.getOrderedProducts( rest._id ) // Getting products details in order details

        const { createdAt } = rest
        // To set time as Moth Date Year, the month is in letters
        const formattedDate = new Intl.DateTimeFormat('en-US', {

            year: 'numeric',
            month: 'long',
            day: 'numeric',

        }).format( createdAt )
        // To remove seconds from time
        const formattedTime = createdAt.toLocaleTimeString('en-US', {

            hour: '2-digit',
            minute: '2-digit',
            hour12: true,

        })

        const orderedData = {

            ...rest,
            orderedDate : formattedDate,
            orderedTime : formattedTime,
            products : orderedProducts[0].productDetails

        }
        response.status(200).json({ orderData : orderedData })

    } catch( error ) { response.status(500).json({ error : 'Error occured while getting order details' }) }

})

// Cancel order
router.put('/cancelOrder', userAuth, async ( request, response, next ) => {

    try {

        const { orderId } = request.body
        const orderData = await OrderModel.findOne({ _id : orderId })
        if( orderData.status === 'cancelled' ) return response.status( 200 ).json({ warning : 'Order already cancelled' })
        else {
    
            const updateResponse = await OrderModel.updateOne(

                { _id : orderId },
                { $set : { status : 'cancelled' } }

            )
            if( updateResponse.modifiedCount === 0 ) response.status( 200 ).json({ warning : 'Order not found' })
            else response.status( 200 ).json({ message : 'Product cancelled successfully' })    
    
        }

    } catch( error ) { response.status( 500 ).json({ error : 'Error occured while canceling order' }) }

})

module.exports = router;
