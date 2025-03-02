const jwt = require('jsonwebtoken')

const generateToken = ( userId, response ) => {

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn : '1d' })
    response.cookie('jsonWebToken', token, {

        maxAge : 1 * 24 * 60 * 60 * 1000,
        httpOnly : true,
        sameSite : "strict",
        secure : process.env.NODE_ENV !== 'development'

    })

}

module.exports = generateToken