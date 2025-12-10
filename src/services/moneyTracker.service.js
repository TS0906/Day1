import mongoose from "mongoose";
import TransactionModel from "../models/transaction.js";
import CategoryModel from "../models/category.js";
import UserModel from "../models/user.js";

const createCategory = async (categoryBody, userId) =>{
    if(await CategoryModel.findOne({name: categoryBody.name, ownerId: userId, isDeleted: false})){
        return{
            success: false,
            message: 'Category name already exists for this user.'
        }
    };
    const newCategory = new CategoryModel({...categoryBody, ownerId: userId});
    try{
        const category = await newCategory.save();
        return{
            success: true,
            data: category
        };
    } catch(error){
        if(error.name === 'ValidationError'){
            return {
                success: false,
                message: error.message
            };
        }
        return {
            success: false,
            message: 'Internal Server Error'
        };
    }
};
const getCategoryByUserId = async (categoryBody, userId) => {
    const categories = await CategoryModel.findOne({ownerId: userId, isDeleted: false});
    return {
        success: true,
        data: categories
    };
};
const createTransaction = async (transactionBody, userId) => {
    const category = await CategoryModel.findOne({
        _id: transactionBody.categoryId,
        ownerId: userId,
        isDeleted: false
    });
    if(!category){
        return{
            success: false,
            message: 'Category not found or does not belong to user.'
        }
    }
    if(category.type !== transactionBody.type){
        return {
            success: false,
            message: `Transaction type must be ' ${category.type}' to match the category`
        };
    }
    if(transactionBody.type === 'Expense') {
        const user = await UserModel.findById(userId);
        if(user && user.limitActive && user.dailyLimit > 0) {
            const transactionDate = new Date(transactionBody.date);
            const startOfDay = new Date(transactionDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(transactionDate);
            endOfDay.setHours(23, 59, 59, 999);
            const todayExpensesResult = await TransactionModel.aggregate([
                {
                    $match:{
                        ownerId: user._id,
                        type: 'Expense',
                        isDeleted: false,
                        date: {$gte: startOfDay, $lte: endOfDay},
                    },
                },
                {$group: {_id: null, total: {$sum: '$amount'}}},
            ]);
            const currentTotalSpent = todayExpensesResult.length > 0 ? todayExpensesResult[0].total : 0;
            const newTotalSpent = currentTotalSpent + transactionBody.amount;
            if(newTotalSpent > user.dailyLimit){
                console.warn(`[DAILY LIMIT ALERT] User ${userId} exceeded limit (${user.dailyLimit}). New total: ${newTotalSpent.toFixed(2)}`);
            }
        }
    }
};
const getTransactionsWithFilters = async (userId, filters) => {
    const query = { ownerId: userId, isDeleted: false };
    
    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.type) query.type = filters.type;

    if (filters.from || filters.to) {
        query.date = {};
        if (filters.from) query.date.$gte = new Date(filters.from);
        if (filters.to) {
            const endDate = new Date(filters.to);
            endDate.setHours(23, 59, 59, 999);
            query.date.$lte = endDate;
        }
    }

    const transactions = await TransactionModel.find(query).populate('categoryId', 'name type').sort({ date: -1 });
    return { success: true, data: transactions };
};
const deleteTransactionById = async (transactionId, userId) => {
    const transaction = await TransactionModel.findOne({_id: transactionId, ownerId: userId, isDeleted: false});
    if(!transaction){
        return {success: false, message: 'Transaction not found or anauthorized.'};
    }
    transaction.isDeleted = true,
    await transaction.save();
    return {success: true, message: 'Transaction deleted successfullly.'};
};
const getMonthlySummary = async (userId, year) => {
    const pipeLine = [
        {
            $match: {
                ownerId: new mongoose.Types.ObjectId(userId),
                isDeleted: false,
                date: {$gte: new Date(`${year}-01-01T00:00:00.000Z`), $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`)}
            },
        },
        { $group: { _id: { month: { $month: '$date' }, type: '$type' }, totalAmount: { $sum: '$amount' } } },
        { $group: { _id: '$_id.month', transactions: { $push: { type: '$_id.type', total: '$totalAmount' } } } },
        {
            $project: {
                _id: 0, month: '$_id',
                income: { $ifNull: [{ $arrayElemAt: ['$transactions.total', { $indexOfArray: ['$transactions.type', 'Income'] }] }, 0] },
                expense: { $ifNull: [{ $arrayElemAt: ['$transactions.total', { $indexOfArray: ['$transactions.type', 'Expense'] }] }, 0] },
                net: { $subtract: [
                    { $ifNull: [{ $arrayElemAt: ['$transactions.total', { $indexOfArray: ['$transactions.type', 'Income'] }] }, 0] },
                    { $ifNull: [{ $arrayElemAt: ['$transactions.total', { $indexOfArray: ['$transactions.type', 'Expense'] }] }, 0] },
                ] },
            },
        },
        {$sort: {month: 1}},
    ];
    const summary = await TransactionModel.aggregate(pipeLine);
    return {success: true, data: summary};
};
const updateDailyLimit = async (userId, updateBody) => {
    const user = await UserModel.findById(userId);
    if(!user){
        return {success: false, message: 'User not found. '};
    }
    if (updateBody.dailyLimit !== undefined){
        if(updateBody.dailyLimit < 0){
            return {success: false, message: 'Daily limit cannot be negative.'};
        }
        user.dailyLimit = updateBody.limitActive;
    }
    await user.save();
    return{success: true, date: user};
};

export const moneyTrackerService = {
    createCategory,
    getCategoryByUserId,
    createTransaction,
    getTransactionsWithFilters,
    deleteTransactionById,
    getMonthlySummary,
    updateDailyLimit,
};