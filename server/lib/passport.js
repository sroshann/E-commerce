const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

passport.use( 
    
    new GoogleStrategy(
        
        {

            clientID : process.env.GOOGLE_CLIENT_ID,
            clientSecret : process.env.GOOGLE_CLIENT_SECRET,
            callbackURL : 'http://localhost:3001/common/google/redirect'

        },
        ( accessToken, refreshToken, profile, callBack ) => {

            User.findOrCreate({ googleId : profile.id }, ( error, user ) => callBack( error, user ))

        }

    )

)