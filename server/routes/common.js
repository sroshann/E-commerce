const express = require('express')
const UserModel = require('../models/user')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const otpGenerator = require('otp-generator')
const { storeTemporaryVariables } = require('../helpers/auth')
const nodemailer = require('nodemailer')
const Mailgen = require('mailgen')
const { EMAIL, PASSWORD, JWT_SECRET } = require('../env')
const { resetPass, userAuth } = require('../middleware/authMiddleware')

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
                response.status(200).json({ error: 'Username already exist' })
            else if( email && email === request.body.email ) 
                response.status(200).json({ error: 'Email already exist' })
            else if ( phoneNumber && phoneNumber === request.body.phoneNumber )
                response.status( 200 ).json({ error : 'Phone number already exist' })

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
    
            await schemaObj.save()
            response.status( 200 ).json({ message : 'User created successfully' })

        }

    } catch( error ) { response.status( 500 ).json({ error: 'Error occurred while creating user' }) }

})

// Login
router.post('/login', async ( request, response, next ) => {

    try {

        const user = await UserModel.findOne({ email : request.body.email })
        if ( user ) {
            
            // The user email is stored into temporary variable inorder to get it in mail sending
            storeTemporaryVariables.email = user?.email
            const compare = bcrypt.compareSync( request.body.password, user.password )
            if ( compare ) {

                // Initializing token
                const token = jwt.sign({ 
                    
                    userId : user._id,
                    username : user.username, 
                    admin : user.isAdmin || false
                
                }, JWT_SECRET, { expiresIn : '1h' })

                // Initialozing it back to null if forgeot password is not used
                storeTemporaryVariables.email = null

                response.status(200).json({ 
                    
                    message : 'User authenticated',
                    userId : user._id,
                    username : user.username,
                    admin : user.isAdmin || false,
                    token 
                
                })

            }
            else response.status( 200 ).json({ error : 'Invalid password' })

        } else response.status( 500 ).json({ error : 'User not found' })

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while login' }) }

})

// Mail OTP
router.get('/mailOTP', resetPass, async ( request , response , next ) => {

    try {

        // generating OTP with 6 charecters
        const generatedOTP = otpGenerator.generate( 6, {

            lowerCaseAlphabets : false,
            upperCaseAlphabets : false,
            specialChars : false

        } )
        storeTemporaryVariables.OTP = generatedOTP

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
            to : storeTemporaryVariables.email,
            subject : 'Reset password',
            html : mail

        }
        
        transporter.sendMail( message ).then( () => response.status( 200 ).json({ message : 'OTP send to your registered mail' }))
        .catch( error => response.status( 500 ).json({ error : 'Error occured while mailing OTP' }))

    } catch ( error ) { response.status(500).json({ error: 'Error occurred while mailing OTP' }) }

})

// Validate OTP
router.post('/validateOTP', resetPass, async ( request, response, next ) => {

    try {

        const { otp } = request.body
        if ( otp === storeTemporaryVariables.OTP ) {

            // OTP is true
            storeTemporaryVariables.OTP = null // Resetting the value to null inorder to avoid conflicts
            response.status(200).json({ message: 'Change the password' })

        } else { response.status(500).json({ error: 'OTP mismatches, check the mail again' }) }

    } catch( error ) { response.status(500).json({ error: 'Error occurred while validating OTP' }) }

})

// Change password
router.put('/changePassword', resetPass, async ( request, response, next ) =>{

    try {

        const email = storeTemporaryVariables.email
        const { password } = request.body

        const hashedPassword = bcrypt.hashSync( password , 10 )
        const user = await UserModel.findOne({ email : email })
        if( user ) {

            await UserModel.updateOne({ email : email }, { password : hashedPassword })
            storeTemporaryVariables.email = null // Resetting the value to null inorder to avoid conflicts
            response.status( 200 ).json({ message : 'Password updated' })

        } else response.status(500).json({ error: 'Some error on updating password' })

    } catch ( error ) { response.status(500).json({ error: 'Error occured while updating password' }) }

})

// Get user details
router.post('/getUserDetails', userAuth, async ( request, response, next ) => {

    try {

        const user = await UserModel.findOne({ username : request.body.username })
        if( user ) return response.status(200).json({ user })
        else response.status(500).json({ error: 'User not found' })

    } catch ( error ) { response.status(500).json({ error: 'Error on getting user details' }) }

})

module.exports = router;