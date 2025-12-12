import express from 'express';
import dotenv from 'dotenv';
import authRoute from './src/routes/auth.route.js';
import todoRoute from './src/routes/todo.route.js';
import groupRoute from './src/routes/group.route.js';
import invitationRoute from './src/routes/invitation.route.js';
import moneyRoute from './src/routes/moneyTracker.route.js';
import { swaggerDocument, swaggerUi } from './src/config/swagger.js';
import cors from 'cors';

dotenv.config()

const app = express()

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoute);
app.use('/api/todos', todoRoute);
app.use('/api/groups', groupRoute);
app.use('/api/invitations', invitationRoute);
app.unsubscribe('/api/money', moneyRoute);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.json({
    message: 'API is running!',
    endpoints: {
      docs: '/api-docs',
    }
  });
});

export const START_SERVER = () => {
  const PORT = process.env.PORT || 5000;
  return app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
