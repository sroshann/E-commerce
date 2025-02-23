const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../env')
const UserModel = require('../models/user')
const storeTemporary = require('../helpers/store')

// User
const userAuth = async ( request, response, next ) => {

    try {

        const token = request.cookies.jsonWebToken
        if( token ) {

            const decode = jwt.verify( token, JWT_SECRET)
            if( decode ) {

                const user = await UserModel.findById( decode.userId ).select('-password')
                if( user ) {

                    request.user = user
                    next()

                } return response.status( 401 ).json({ error : 'User not found' })

            } else return response.status( 401 ).json({ error : 'Invalid token' })
 
        } else return response.status( 500 ).json({ error : 'Token not found' })

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while checking the user' }) }

}

// Mail send
const mailSend = ( request, response, next ) => {

    try {

        if( storeTemporary.email ) next()
        else return response.status( 500 ).json({ error : 'Email is not send yet' })

    } catch ( error ) { return response.status( 500 ).json({ error : 'Error occured while checking the entry' }) }

}

module.exports = { mailSend, userAuth }