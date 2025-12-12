import mongoose from "mongoose";
import TransactionModel from "../models/transaction.js";

export const checkTransactionOwnership = async (req, res, next) => {
    try {
        const {transactionId} = req.params;
        const userId = req.user._id;
        if(!ObjectId.isValid(transactionId)){
            return res.status(400).json({success: false, error: "Invalid transaction ID"});
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
        if(transaction.ownerId.toString() !== userId.toString() && req.user.role !== "admin"){
            return res.status(403).json({
                success: false,
                errors: ['Permission denied, you do not own this resource.']
            });
        }
        req.transaction = transaction;
        next();
    } catch (error) {
        console.error("TransactionOwner Error", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};