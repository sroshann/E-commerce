var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')
const fileUpload = require('express-fileupload')
const mongoose = require('mongoose')
const session = require('express-session')
const cookie = require('cookie-parser')

var app = express();

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const commonRouter = require('./routes/common')

const connectionString = 
"mongodb+srv://shamilroshan390:123@cluster0.ncgk1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

app.use( cookie() )
app.use( session({ 
    
    secret : 'user-data',
    resave: false,
    saveUninitialized: true,
    cookie : { maxAge : 60000 * 2 }
    
}) )
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())
app.use( fileUpload() )


app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/common', commonRouter)

run = async () => {

    try {

        await mongoose.connect( connectionString )
        console.log('DB connected')

    } catch ( error ) { console.error( error ) }

}
run().catch( console.dir )

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
