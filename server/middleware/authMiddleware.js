const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../env')
const { storeTemporaryVariables } = require('../helpers/auth')

// ADMIN
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

// USER
const userAuth = ( request, response, next ) => {

    try {

        const token = request.headers.authorization.split(" ")[1]
        if( token ) {

            const decodedToken = jwt.verify( token, JWT_SECRET )
            if( decodedToken ) next()
            else return response.status( 500 ).json({ error : 'Please login' })
 
        } else return response.status( 500 ).json({ error : 'Please login' })

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while checking the user' }) }

}

// RESET PASSWORD
const resetPass = ( request, response, next ) => {

    try {
        email = storeTemporaryVariables.email
        if( email ) next()
        else response.status( 500 ).json({ error : 'Provide username in login' })

    } catch ( error ) { response.status( 500 ).json({ error : 'Error occured while checking the entry' }) }

}

module.exports = { adminAuth, resetPass, userAuth }