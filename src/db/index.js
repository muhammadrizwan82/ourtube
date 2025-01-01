import mongoose from "mongoose";
import { DB_Name } from '../constants.js'

const connectDB = async () => {
    try {

        const dbURL = `${process.env.MONGODB_URL}/${DB_Name}`;
        console.log("Connecting to database at", DB_Name);
        const connectionInstance = await mongoose.connect(dbURL);
        console.log(`MongoDB connected DB Host:${connectionInstance.connection.host}`);


    } catch (error) {
        console.log('MongoDB connection error', error)
        process.exit(1)
    }
}

export default connectDB;