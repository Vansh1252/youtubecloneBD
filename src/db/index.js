const mongoose = require('mongoose');


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`)
        console.log(`\n mongoDB connected !! DB HOST :${connectionInstance}`);
    } catch (error) {
        console.log("MONGODB connection error:", error);
        throw error
        process.exit(1)
    }
}

module.exports = connectDB