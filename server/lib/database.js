const mongoose = require('mongoose')

const connectDB = async () => {

    try {

        const connectionString = 
        "mongodb+srv://shamilroshan390:123@cluster0.ncgk1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
        await mongoose.connect( connectionString )
        console.log('Database connected')

    } catch ( error ) { console.log('Error occured on connecting database') }

}

module.exports = connectDB