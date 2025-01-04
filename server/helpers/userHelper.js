const CartModel = require("../models/cart")
const OrderModel = require("../models/order")
const WishlightModel = require("../models/wishlights")

const userHelperFunctions = {

    // Function used to get carted product details
    getCartedProducts: async (userId) => {

        try {

            return await CartModel.aggregate([

                { $match: { user: userId } },
                { $unwind: '$cartedProducts' },
                {
                    $project: {

                        productId: { $toObjectId: '$cartedProducts.productId' },
                        count: '$cartedProducts.count'

                    }
                },
                {
                    $lookup: {

                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'productDetails'

                    }
                },
                {
                    $project: {

                        count: 1,
                        productDetails: 1

                    }
                },
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

        } catch (error) { console.log(error) }

    },

    // Function used to get quantity of products form 'products' collection and current count stored in 'cart' collection
    getCartedCountAndProductQuantity: async (userId, productId) => {

        try {

            return await CartModel.aggregate([

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

        } catch (error) { console.log(error) }

    },

    // Function used to get wishlighted product details
    getWishlightedProducts: async (userId) => {

        try {

            return await WishlightModel.aggregate([

                { $match: { user: userId } },
                {

                    $lookup: {

                        from: 'products', // collection name which is to be joined
                        let: { prdctLstOfWshlghts: '$wishlightedProducts' }, // storing wishlighted product array into a variable,
                        pipeline: [{

                            $match: {

                                $expr: {

                                    $in: [

                                        '$_id',
                                        {

                                            $map: {

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
                        as: 'wishlightedItems'

                    }

                }

            ])

        } catch (error) { console.log(error) }

    },

    // Function used to get ordered products
    getOrderedProducts: async (matchingId) => {

        // The same function is used to get all orders of user and displaying single
        // So the matching depends on requirements
        try {

            return await OrderModel.aggregate([

                { 
                    
                    $match: { 

                        $or: [
                            { _id: matchingId },
                            { user: matchingId },
                        ]

                    } 
            
                },
                { $unwind: '$products' },
                {
                    $project: {

                        productId: { $toObjectId: '$products.productId' },
                        count: '$products.count',
                        status : 1

                    }
                },
                {
                    $lookup: {

                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'productDetails'

                    }
                },
                {
                    $project: {

                        count: 1,
                        productDetails: 1,
                        status : 1

                    }
                },
                {
                    $group: {
                        _id: '$productId', // Group by productId
                        productDetails: {
                            $push: {
                                $mergeObjects: [

                                    { 'orderId' : '$$ROOT._id' },
                                    { 'orderStatus' : '$$ROOT.status' },
                                    { $arrayElemAt: ['$productDetails', 0] }, // Extract product details object
                                    { count: '$count' }, // Add quantity
                                    
                                ],
                            },
                        },
                    },
                }

            ])

        } catch (error) { console.log(error) }

    }

}

module.exports = userHelperFunctions
