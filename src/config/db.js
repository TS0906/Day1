import {MongoClient, ServerApiVersion} from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_NAME = process.env.DATABASE_NAME
const MONGO_URI = process.env.MONGO_URI
let testDatabaseInstance = null
let mongoClientInstance = null


export const CONNECT_DB = async() => {
    try{
        if(!MONGO_URI) throw new Error("MONGO_URI loi");
        if(!DATABASE_NAME) throw new Error("DATABASE_NAME loi");

        mongoClientInstance = new MongoClient(MONGO_URI, {serverApi: {
            version: ServerApiVersion.v1,
            strict: true, 
            deprecationErrors: true
        }});

        await mongoClientInstance.connect()
        testDatabaseInstance = mongoClientInstance.db(DATABASE_NAME);

        await testDatabaseInstance.collection('users').createIndex({ email: 1 }, { unique: true });
        await testDatabaseInstance.collection('todos').createIndex({ user_id: 1 });
        await testDatabaseInstance.collection('groups').createIndex({owner_id: 1});
        await testDatabaseInstance.collection('groups').createIndex({ 'members.user_id': 1 });
        await testDatabaseInstance.collection('invitations').createIndex({invitee_email: 1});
        await testDatabaseInstance.collection('invitations').createIndex({ token: 1 }, { unique: true });
        await testDatabaseInstance.collection('invitations').createIndex({ expires_at: 1 });

        console.log("Connected to MongoDB");
        return testDatabaseInstance;
    } catch(error){
        console.log("Failed to connect MongoDB", error.message);
        throw error;
    }

};
export const GET_DB = () => {
    if(!testDatabaseInstance) throw new Error("Connect to database first!");
    return testDatabaseInstance;
};