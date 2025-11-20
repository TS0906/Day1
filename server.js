import express from 'express';
import {CONNECT_DB, GET_DB} from './src/config/db.js';
import dotenv from 'dotenv';
import authRoute from './src/routes/auth.route.js';
import todoRoute from './src/routes/todo.route.js';
import groupRoute from './src/routes/group.route.js';
import invitationRoute from './src/routes/invitation.route.js';
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
app.use('/api/groups', groupRoute);
app.use('/api/invitations', invitationRoute);

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
        get_me: 'GET /api/auth/me',
        get_all_users: 'GET /api/auth/users (admin only)',
        update_user_role: 'PATCH /api/auth/users/:id/role (admin only)'
      },
      groups: {
                create: 'POST /api/groups',
                get_my_groups: 'GET /api/groups/my-groups',
                get_all_groups: 'GET /api/groups (admin only)',
                get_group: 'GET /api/groups/:id',
                update: 'PUT /api/groups/:id',
                delete: 'DELETE /api/groups/:id',
                leave: 'POST /api/groups/:id/leave'
      },
      todos: {
                create_personal: 'POST /api/todos',
                create_group: 'POST /api/todos/groups/:groupId',
                get_my_todos: 'GET /api/todos/my-todos',
                get_group_todos: 'GET /api/todos/groups/:groupId',
                get_todo: 'GET /api/todos/:id',
                update_status: 'PATCH /api/todos/:id/status',
                delete: 'DELETE /api/todos/:id'
      },
      invitations: {
                create: 'POST /api/invitations/groups/:groupId/invite',
                get_my_invitations: 'GET /api/invitations/my-invitations',
                accept: 'POST /api/invitations/:token/accept',
                reject: 'POST /api/invitations/:token/reject'
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
