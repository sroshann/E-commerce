const express = require('express')
const UserModel = require('../models/user')
const ProductModel = require('../models/product')
const router = express.Router()
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer')
const Mailgen = require('mailgen')
const { userAuth, mailSend } = require('../middleware/authMiddleware')
const generateToken = require('../lib/jwt')
const storeTemporary = require('../helpers/store')
const passport = require('passport')
const jwt = require('jsonwebtoken')

// Signup
router.post('/signup', async ( request, response, next ) => {

    try {

        const user = await UserModel.findOne({

            $or: [

                { email: request.body.email },
                { username: request.body.username },
                { phoneNumber : request.body.phoneNumber }

            ]

        })
        if( user ) {

            const { email , username , phoneNumber } = user
            if( username && username === request.body.username ) 
                return response.status(401).json({ error: 'Username already exist' })
            else if( email && email === request.body.email ) 
                return response.status(401).json({ error: 'Email already exist' })
            else if ( phoneNumber && phoneNumber === request.body.phoneNumber )
                return response.status( 401 ).json({ error : 'Phone number already exist' })

        } else {

            let schemaObj = new UserModel({

                fullname : request?.body?.fullName,
                username : request?.body?.userName,
                email : request?.body?.email,
                phoneNumber : request?.body?.phoneNumber,
                password : request?.body?.password,
                profileImage : request?.body?.profileImage
    
            })
    
            // Encrypting password
            schemaObj.password = bcrypt.hashSync( schemaObj.password , 10 )
            const newUser = await schemaObj.save()
            generateToken( newUser._id, response )
            const { password, __v, ...rest } = newUser.toObject()
            return response.status( 200 ).json({ message : 'User created successfully', userDetails : rest })

        }

    } catch( error ) { return response.status( 500 ).json({ error: 'Error occurred while creating user' }) }

})

// Login
router.post('/login', async ( request, response, next ) => {

    try {

        // user is a Mongoose document, so we can convert it into a plain js object using lean inorder to destrucure it
        const user = await UserModel.findOne({ email : request.body.email }).lean()
        if ( user ) {
            
            const compare = bcrypt.compareSync( request.body.password, user.password )
            if ( compare ) {

                // generating token and assigning it into cookies
                generateToken( user._id, response )
                const { password, __v, ...rest } = user 
                return response.status(200).json({ message : 'User authenticated', userDetails : rest })

            }
            else return response.status( 401 ).json({ error : 'Invalid credentials' })

        } else return response.status( 401 ).json({ error : 'Invalid credentials' })

    } catch ( error ) { return response.status( 500 ).json({ error : 'Error occured while login' }) }

})

// Logout
router.get('/logout', ( request, response ) => {

    try {

        // Authenticated user details are stored in passport session 
        // So it should cleared using this 'logout'
        // request.logOut() 
        response.cookie('jsonWebToken', '', { maxAge : 0 })
        return response.status( 200 ).json({ message : 'Loged out successfully' })

    } catch( error ) { return response.status( 500 ).json({ error : 'Error occured on logging out' }) }

})

// Mail OTP
router.post('/mailOTP', async ( request , response , next ) => {

    try {

        const { email } = request.body

        // generating OTP with 6 charecters
        const generatedOTP = otpGenerator.generate( 6, {

            lowerCaseAlphabets : false,
            upperCaseAlphabets : false,
            specialChars : false

        } )
        storeTemporary.OTP = generatedOTP

        // Sending the generated OTP to email of user
        let config = {

            service : 'gmail',
            auth : {

                user : process.env.EMAIL,
                pass : process.env.PASSWORD

            }

        }
        
        let transporter = nodemailer.createTransport( config )
        let mailGenerator = new Mailgen({

            theme : 'default',
            product : {

                name : 'Mailgen',
                link : 'https://mailgen.js/'

            }

        })
        let mailFormat = {

            body : {

                name : 'E-Commerce application',
                intro : 'Use this one time password(OTP) to reset your password',
                table : {

                    data : {

                        OTP : generatedOTP,
                        text : 'It will expire in 3 minutes'

                    }

                },
                outro : "It's a pleasure to assist you"

            }

        }
        let mail = mailGenerator.generate( mailFormat )

        let message = {

            from : process.env.EMAIL,
            to : email,
            subject : 'Reset password',
            html : mail

        }
        
        transporter.sendMail( message ).then( () => {

            storeTemporary.email = email
            return response.status( 200 ).json({ message : 'OTP send to your registered mail' })

        })
        .catch( error => { return response.status( 500 ).json({ error : 'Error occured while mailing OTP' }) })

    } catch ( error ) { return response.status(500).json({ error: 'Error occurred while mailing OTP' }) }

})

// Validate OTP
router.post('/validateOTP', mailSend, async ( request, response, next ) => {

    try {

        const { otp } = request.body
        if ( otp === storeTemporary.OTP ) {

            // OTP is true
            storeTemporary.OTP = null // Resetting the value to null inorder to avoid conflicts
            response.status(200).json({ message: 'Change the password' })

        } else { response.status(500).json({ error: 'OTP mismatches, check the mail again' }) }

    } catch( error ) { response.status(500).json({ error: 'Error occurred while validating OTP' }) }

})

// Change password
router.put('/changePassword', mailSend, async ( request, response, next ) =>{

    try {

        const { password } = request.body
        const hashedPassword = bcrypt.hashSync( password , 10 )
        const user = await UserModel.findOne({ email : storeTemporary.email })
        if( user ) {

            await UserModel.updateOne({ email : storeTemporary.email }, { password : hashedPassword })
            storeTemporary.email = null // Resetting the value to null inorder to avoid conflicts
            return response.status( 200 ).json({ message : 'Password updated' })

        } else return response.status(401).json({ error: 'Some error on updating password' })

    } catch ( error ) { 
        
        console.log( error )
        return response.status(500).json({ error: 'Error occured while updating password' }) }

})

// Get user details
router.get('/getUserDetails', async ( request, response, next ) => {

    try { 
        
        const token = request.cookies.jsonWebToken
        if( token ) {

            const decode = jwt.verify( token, process.env.JWT_SECRET)
            if( decode ) {

                const user = await UserModel.findById( decode.userId ).select('-password')
                return response.status(200).json({ user }) 

            }

        } else return
    
    } 
    catch ( error ) { response.status(500).json({ error: 'Error on getting user details' }) }

})

// Get product details
router.get('/getProductDetails/:productId', async ( request, response, next ) => {

    try {

        const { productId } = request.params
        const productDetails = await ProductModel.findOne({ _id : productId })
        if( productDetails ) return response.status(200).json({ productDetails })
        else return response.status(200).json({ warning : "Could'nt find the product" })

    } catch ( error ) {

        console.log( error )
        response.status(500).json({ error : 'Error occured while getting product details' })

    }

})

// Update user details
router.put('/updateUserDetails', userAuth, async ( request, response, next ) => {

    try {

        // These are the data which is to be updated, the data which not to update will have the value null
        const { userId, fullname, email, phoneNumber, address, profileImage } = request.body

        // Checks whether the newly provided details is an already existing details in DB, 
        // if it exist then stop the updating process.
        const user = await UserModel.findOne({

            $or : [

                { email : email },
                { phoneNumber : phoneNumber }

            ]

        })

        if( user ) {

            if( user.email && user.email === email ) return response.status( 200 ).json({ warning : 'Email alrerady exist' })
            else if( user.phoneNumber && user.phoneNumber === phoneNumber )
                return response.status( 200 ).json({ warning : 'Phone number already exist' })

        } else {

            // The updateData object only have the data which is not null, so it will only update the changed data
            const updateData = {}
            if( fullname ) updateData.fullname = fullname
            if( email ) updateData.email = email
            if( phoneNumber ) updateData.phoneNumber = phoneNumber
            if( address ) updateData.address = address
            if( profileImage ) updateData.profileImage = profileImage

            // Updates the user data
            const updateResponse = await UserModel.updateOne(
                
                { _id : userId },
                { $set : updateData }
            
            )

            if( updateResponse.modifiedCount === 0 ) 
                return response.status(200).json({ warning: 'An error occured while updating user details' })
            else return response.status(200).json({ message : 'User details are updated successfully' })

        }

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while updating user details' }) }

})

// Google sign up route
router.get('/signup/google', passport.authenticate('google', { scope : ['profile', 'email'] }))

// Google redirect route
router.get('/google/redirect', passport.authenticate('google', { 
    
    successRedirect : `${ process.env.CLIENT_URL }/home`,
    failureRedirect : '/common/google/auth/falied' 
    
}))

// Google authentication success
router.get('/google/auth/success', ( request, response, next ) => {

    try {

        // Authenticated user details are present in passport session
        if( request?.user ) {

            generateToken( request?.user?._id, response )
            return response.status( 200 ).json({

                message : 'User logged in successfully',
                userDetails : request.user
    
            })

        } else return response.status( 401 ).json({ error : 'User not authorized' })

    } catch( error ) 
        { return response.status(500).json({ error : 'Error occured on getting user details on google auth' }) }

})

// Google authentication failed 
router.get('/google/auth/failed', 
    ( request, response, next ) => response.status(401).json({ error : 'Authentication failed' }))

module.exports = router