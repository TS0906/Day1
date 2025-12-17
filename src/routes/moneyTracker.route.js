import express from 'express';
import { authToken } from '../middlewares/auth.middleware.js';
import { checkTransactionOwnership } from '../middlewares/moneyTracker.middleware.js';
import { moneyTrackerController } from '../controllers/moneyTracker.controller.js';

const router = express.Router();

router.post('/categories', authToken, moneyTrackerController.createCategory);
router.get('/categories', authToken, moneyTrackerController.getCategories);

router.post('/transactions', authToken, moneyTrackerController.createTransaction);
router.get('/transactions', authToken, moneyTrackerController.getTransactions);

router.delete(
  '/transactions/:transactionId',
  authToken,
  checkTransactionOwnership,          
  moneyTrackerController.deleteTransaction
);

router.get('/summary', authToken, moneyTrackerController.getSummary);
router.patch('/limit', authToken, moneyTrackerController.updateLimitSettings);

export default router;