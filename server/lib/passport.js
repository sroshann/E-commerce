const passport = require('passport')
const UserModel = require('../models/user')
const GoogleStrategy = require('passport-google-oauth20').Strategy

passport.use( 
    
    new GoogleStrategy(
        
        {

            clientID : process.env.GOOGLE_CLIENT_ID,
            clientSecret : process.env.GOOGLE_CLIENT_SECRET,
            callbackURL : process.env.PASSPORT_CALLBACK_URL,
            scope : [ 'profile', 'email' ]

        },
        async ( req, accessToken, refreshToken, profile, callBack ) => {

            try {

                const { email, email_verified, sub, name, picture } = profile._json
                // Checking whether the email is verified by google or not
                if( email_verified ) {

                    // If the user is new, then return with google data, else return with database data
                    let user = await UserModel.findOne({ email }).select('-password')
                    if( !user ) {

                        // New user with google account
                        user = await new UserModel({

                            fullname : name,
                            email,
                            profileImage : picture,
                            googleId : sub

                        }).save()
                        return callBack( null, user )

                    } else return callBack( null, user )

                } else return callBack( null, false ) // Authentication failed

            } catch( error ) { return callBack( error, false ) }

        }   

    )

)

// Authenticated user details are stored in passport session
passport.serializeUser(( user, callBack ) => callBack( null, user ))
passport.deserializeUser(( user, callBack ) => callBack( null, user ))