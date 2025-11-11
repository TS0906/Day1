import { CONNECT_DB } from './config/db.js';
import { startServer } from './server.js';

const startApp = async () => {
    try {
        await CONNECT_DB();
        startServer();
    } catch (error) {
        console.log('Failed', error.message);
        process.exit(1);
    }
};

startApp();