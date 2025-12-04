import { connectDB } from './config/db.js';
import { START_SERVER } from '../server.js';

const startApp = async () => {
    try {
        console.log('Attempting to connect to the database...');
        await connectDB();
        console.log('Starting the server...');
        START_SERVER();
    } catch (error) {
        console.log('Failed to start application: ', error.message);
        process.exit(1);
    }
};

startApp();