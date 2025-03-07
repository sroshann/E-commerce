var express = require('express')
var logger = require('morgan')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const passport = require('passport')
require('dotenv').config()
require('./lib/passport')
const http = require('http')
const session = require('express-session')

var app = express()

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const commonRouter = require('./routes/common');
const connectDB = require('./lib/database');

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
    
    origin: process.env.CLIENT_URL,
    credentials: true, // Important when sending cookies
    allowedHeaders: ["Content-Type", "Authorization"] // Specify headers
    
}))
app.use(fileUpload())
app.use(session({

    secret: 'SECRET',  // Change this to a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }   // Set secure: true if using HTTPS

}))

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/common', commonRouter)

app.use( passport.initialize() )
app.use( passport.session() )

var server = http.createServer(app)
server.listen( process.env.PORT || '3001', () => {

    console.log('Server is running')
    connectDB()

})

module.exports = app;
