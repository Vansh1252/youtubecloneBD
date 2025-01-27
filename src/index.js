// require('dotenv').config({ path: './env' })
const dotenv = require('dotenv');
const connectDB = require('./db/index.js');
const app = require('./app.js');

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`server is running at port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("mongoose connection failed...",err);
})
























/*
const express = require('express');
const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("error:", error);
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("error:", error);
        throw error
    }
})()
*/