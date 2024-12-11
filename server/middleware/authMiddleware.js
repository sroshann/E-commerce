const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../env')
const { storeTemporaryVariables } = require('../helpers/auth')

// Admin
const adminAuth = ( request, response, next ) => {

    try {

        const token = request.headers.authorization.split(" ")[1]
        if( token ) {

            const decodeToken = jwt.verify( token, JWT_SECRET )
            if( decodeToken.admin ) next()
            else response.status( 500 ).json({ error : 'You are not admin' })

        } else response.status( 500 ).json({ error : 'Please login' })

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while checking the user' }) }

}

// User
const userAuth = ( request, response, next ) => {

    try {

        const token = request.headers.authorization.split(" ")[1]
        if( token ) {

            jwt.verify( token, JWT_SECRET, ( error ) => {

                if( error ) {

                    if( error.name === 'TokenExpiredError' ) 
                        return response.status( 500 ).json({ error : 'Session expired please login' })
                    else return response.status( 500 ).json({ error : 'Invalid token' })

                } else next()

            } )
 
        } else return response.status( 500 ).json({ error : 'Session not found please log in' })

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while checking the user' }) }

}

// Rest password
const resetPass = ( request, response, next ) => {

    try {
        email = storeTemporaryVariables.email
        if( email ) next()
        else response.status( 500 ).json({ error : 'Provide username in login' })

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while checking the entry' }) }

}

module.exports = { adminAuth, resetPass, userAuth }