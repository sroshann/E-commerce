const express = require('express')
const UserModel = require('../models/user')
const router = express.Router()
const bcrypt = require('bcrypt')

router.post('/signup', async ( request, response, next ) => {

    try {

        let schemaObj = new UserModel({

            fullname : request?.body?.fullname,
            username : request?.body?.username,
            email : request?.body?.email,
            password : request?.body?.password,

        })

        // Encrypting password
        schemaObj.password = bcrypt.hashSync( schemaObj.password , 10 )

        await schemaObj.save()
        response.status( 200 ).json({ message : 'User created successfully' })

    } catch( error ) {

        console.error( error )
        response.status(500).json({ error: 'Error occurred creating user' })

    }

})

router.post('/login', async ( request, response, next ) => {

    try {

        const user = await UserModel.findOne({ email : request.body.email })
        if ( user ) {

            const compare = bcrypt.compareSync( request.body.password, user.password )
            if ( compare ) {

                // Storing user data into session
                request.session.user = user
                request.session.save()
                response.status(200).json({ message : 'User authenticated' })

            }
            else response.status( 200 ).json({ error : 'Invalid username or password' })

        } else {

            response.status( 200 ).json({ error : 'User not found' })

        }

    } catch ( error ) {  

        console.error( 'Error while login ',error )
        response.json({ error : 'Error occured while login' })

    }

})

module.exports = router;