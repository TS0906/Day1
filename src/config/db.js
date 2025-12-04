import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_NAME = process.env.DATABASE_NAME;
const MONGO_URI = process.env.MONGO_URI;
let databaseInstance = null;

export const connectDB = async () => {
    try{
        if(!MONGO_URI) throw new Error("MONGO_URI is missing.");
        const connection = await mongoose.connect(MONGO_URI, {
            dbName: DATABASE_NAME,
        });
        databaseInstance = connection.connections[0].db;
        console.log("Connected to MongoDB ");
        return databaseInstance;
    } catch (error){
        console.error("Failed to connect to MongoDB:", error.message);
        throw new Error(`Mongoose connection failed: ${error.message}`);
    }
};

export const getDB = () => {
    if(!databaseInstance){
        throw new Error("Database not initialized! Connect to database first.");
    }
    return databaseInstance;
};