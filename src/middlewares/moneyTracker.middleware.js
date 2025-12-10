import mongoose from "mongoose";
import TransactionModel from "../models/transaction.js";

const isValidObjectId = (id) =>{
    return id && typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);
};
const checkTransactionOwnership = async (req, res, next) => {
    try {
        const transactionId = req.params.transactionId;
        if(!transactionId || !isValidObjectId(transactionId)){
            return res.status(400).json({
                success: false,
                errors: ['Invalid Transaction ID format. '],
            });
        }
        const transaction = await TransactionModel.findOne({
            _id: transactionId,
            isDeleted: false
        });
        if(!transaction){
            return res.status(404).json({
                success: false,
                errors: ['Transaction not found.']
            });
        }
        if(transaction.ownerId.toString() !== req.user._id.toString()){
            return res.status(403).json({
                success: false,
                errors: ['Permission denied, you do not own this resource.']
            });
        }
        next();
    } catch (error) {
        console.error("Transaction Ownership Middleware Error", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};
export const moneyTrackerMiddleware = {
    checkTransactionOwnership,
};