const jwt = require('jsonwebtoken')
const { JWT_SECRET, NODE_ENV } = require('../env')

const generateToken = ( userId, response ) => {

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn : '1d' })
    response.cookie('jsonWebToken', token, {

        maxAge : 1 * 24 * 60 * 60 * 1000,
        httpOnly : true,
        sameSite : "strict",
        secure : NODE_ENV !== 'development'

    })

}

module.exports = generateToken