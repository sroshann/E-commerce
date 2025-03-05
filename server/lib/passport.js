const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

passport.use( 
    
    new GoogleStrategy(
        
        {

            clientID : process.env.GOOGLE_CLIENT_ID,
            clientSecret : process.env.GOOGLE_CLIENT_SECRET,
            callbackURL : 'http://localhost:3001/common/google/redirect',
            scope : [ 'profile', 'email' ]

        },
        ( accessToken, refreshToken, profile, callBack ) => {

            console.log( 'Passport.js profile = ', profile._json )
            return callBack( null, profile )

        }

    )

)

// Authenticated user details are stored in passport session
passport.serializeUser(( user, callBack ) => callBack( null, user ))
passport.deserializeUser(( user, callBack ) => callBack( null, user ))