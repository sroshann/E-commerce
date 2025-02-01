const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../env')
const UserModel = require('../models/user')

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

// Rest password
const resetPass = ( request, response, next ) => {

    try {

        email = request.email
        if( email ) next()
        else response.status( 500 ).json({ error : 'Provide username in login' })

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while checking the entry' }) }

}

module.exports = { resetPass, userAuth }