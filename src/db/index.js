import mongoose from "mongoose";
import { DB_Name } from '../constants.js'

const connectDB = async () => {
    try {

        //console.log(process.env.MONGODB_URL)

        const dbURL = `${process.env.MONGODB_URL}/${DB_Name}`;

        console.log("Connecting to database at", dbURL);
        const connectionInstance = await mongoose.connect(dbURL);
        console.log(`MongoDB connected DB Host:${connectionInstance.connection.host}`);


    } catch (error) {
        console.log('MongoDB connection error', error)
        process.exit(1)
    }
}

export default connectDB;