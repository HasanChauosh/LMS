
import mongoose from "mongoose";
import dotenv from "dotenv";

//connect to mongodb database/server

const connectDB =async()=>{
    mongoose.connection.on('connected',()=>{
        console.log('Mongodb is connected')
    })
    mongoose.connection.on('error',()=>{
        console.log('Mongodb is not connected')
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/lms`)

}
export default connectDB