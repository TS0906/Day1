import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoute from './routes/authRoute.js';
import todoRoute from './routes/todoRoute.js';
import { fileURLToPath } from 'url';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import cors from 'cors';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use('/api/auth', authRoute);
app.use('/api/todos', todoRoute);

export default app;