const express = require('express')
const UserModel = require('../models/user')
const ProductModel = require('../models/product')
const router = express.Router()
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer')
const Mailgen = require('mailgen')
const { EMAIL, PASSWORD } = require('../env')
const { userAuth, mailSend } = require('../middleware/authMiddleware')
const generateToken = require('../lib/utils')
const storeTemporary = require('../helpers/store')

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
                response.status(401).json({ error: 'Username already exist' })
            else if( email && email === request.body.email ) 
                response.status(401).json({ error: 'Email already exist' })
            else if ( phoneNumber && phoneNumber === request.body.phoneNumber )
                response.status( 401 ).json({ error : 'Phone number already exist' })

        } else {

            let schemaObj = new UserModel({

                fullname : request?.body?.fullname,
                username : request?.body?.username,
                email : request?.body?.email,
                phoneNumber : request?.body?.phoneNumber,
                password : request?.body?.password,
                profileImage : request?.body?.profileImage
    
            })
    
            // Encrypting password
            schemaObj.password = bcrypt.hashSync( schemaObj.password , 10 )
            const newUser = await schemaObj.save()
            generateToken( newUser._id, response )
            response.status( 200 ).json({ message : 'User created successfully' })

        }

    } catch( error ) { response.status( 500 ).json({ error: 'Error occurred while creating user' }) }

})

// Login
router.post('/login', async ( request, response, next ) => {

    try {

        const user = await UserModel.findOne({ email : request.body.email })
        if ( user ) {
            
            const compare = bcrypt.compareSync( request.body.password, user.password )
            if ( compare ) {

                // generating token and assigning it into cookies
                generateToken( user._id, response )
                response.status(200).json({ message : 'User authenticated' })

            }
            else response.status( 401 ).json({ error : 'Invalid credentials' })

        } else response.status( 401 ).json({ error : 'Invalid credentials' })

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while login' }) }

})

// Logout
router.get('/logout', ( request, response ) => {

    try {

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

                user : EMAIL,
                pass : PASSWORD

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

            from : EMAIL,
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
router.post('/getUserDetails', userAuth, async ( request, response, next ) => {

    try {

        const user = await UserModel.findOne({ username : request.body.username })
        if( user ) return response.status(200).json({ user })
        else response.status(500).json({ error: 'User not found' })

    } catch ( error ) { response.status(500).json({ error: 'Error on getting user details' }) }

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

module.exports = router;