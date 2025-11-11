import express from 'express';
import {CONNECT_DB, GET_DB} from './src/config/db.js';
import dotenv from 'dotenv';
import authRoute from './src/routes/auth.route.js';
import todoRoute from './src/routes/todo.route.js';
import { swaggerDocument, swaggerUi } from './src/config/swagger.js';
import cors from 'cors';

dotenv.config()

const PORT =  process.env.PORT
const app = express()

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoute);
app.use('/api/todos', todoRoute);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/test-db', async (req, res) => {
  try {
    const db = GET_DB();
    const collections = await db.listCollections().toArray();
    res.json({ 
      message: 'Database connection successful!',
      collections: collections.map(col => col.name)
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Database connection failed!',
      details: error.message 
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Todo API is running!',
    endpoints: {
      docs: '/api-docs',
      health: '/health',
      test_db: '/test-db',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        get_me: 'GET /api/auth/me'
      },
      todos: {
        create: 'POST /api/todos',
        list: 'GET /api/todos',
        get: 'GET /api/todos/:id',
        update: 'PUT /api/todos/:id',
        delete: 'DELETE /api/todos/:id',
        toggle: 'PATCH /api/todos/:id/toggle'
      }
    }
  });
});

const START_SERVER = async() => {
  try{
    await CONNECT_DB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    });
  } catch(error){
    console.log(`Failed to start server`)
  }
}

START_SERVER()