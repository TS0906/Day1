import { errorMonitor } from "nodemailer/lib/xoauth2";
import { moneyTrackerService } from "../services/moneyTracker.service.js";
import {validateCategory, validateTransaction, validateSetLimit, validateStatsQuery, validateRegister} from "../utils/validators.js";

export const moneyTrackerController ={
    createCategory: async (req, res)=>{
        try {
            const validationResult = validateCategory(req.body);
            if(!validationResult.isValid){
                return res.status(400).json({
                    success: false,
                    errors: validationResult.errors
                });
            }
            const result = await moneyTrackerService.createCategory(req.body, req.user._id);
            if(result.success){
                res.status(201).json({
                    success: true,
                    data: result.data
                });
            } else{
                let statusCode = 400;
                if(result.message.inludes('exists')){
                    statusCode = 400;
                } else if(result.message.inludes('Internal Server Error')){
                    statusCode = 500;
                }
                res.status(statusCode).json({
                    success: false,
                    errors: [result.message]
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    },
    getCategories: async(req, res) => {
        try {
            const result = await moneyTrackerService.getCategoryByUserId(req.user._id);
            res.status(200).json({
                success: true,
                data: result.data
            });
        } catch (error) {
            res.status(500).json({success: false, error: "Internal Server Error"});
        }
    },
    createTransaction: async(req, res) => {
        try {
            const validationResult = validateTransaction(req.body);
            if(!validationResult.isValid){
                return res.status(400).json({success: false, errors: validationResult.errors});
            }
        } catch (error) {
            res.status(500).json({success: false, error: "Internal Server Error"}); 
        }
    },
    createTransaction: async (req, res) => {
        try {
            const validationResult = validateTransaction(req.body);
            if(!validationResult.isValid){
                return res.status(400).json({success: false, errors: validationResult.errors});
            }
            const result = await moneyTrackerService.createTransaction(req.body, req.user._id);
            if(result.success){
                res.status(201).json({success: true, data: result.data});
            } else{
                let statusCode = 400;
                if(result.message.includes('not found') || result.message.includes('unauthorized')){
                    statusCode = 404;
                }else if(result.message.includes('Internal Server Error')){
                    statusCode = 500;
                }
                res.status(statusCode).json({success: false, errors: [result.message]});
            }
        } catch (error) {
            res.status(500).json({success: false, error: "Internal Server Error"});
        }
    },
    getTransactions: async(req, res) => {
        try {
            const validationResult = validateStatsQuery(req.query);
            if(!validationResult.isValid){
                return res.status(400).json({success: false, errors: validationResult.errors});
            }
            const result = await moneyTrackerService.getTransactionsWithFilters(req.user._id, req.query);
            res.status(200).json({success: true, data: result.data});
        } catch (error) {   
            res.status(500).json({success: false, error: "Internal Server Error"});
        }
    },
    deleteTransaction: async(req, res) => {
        try {
            const transactionId = req.params.transactionId;
            const result = await moneyTrackerService.deleteTransactionById(transactionId, req.user._id);
            if(result.success){
                res.status(204).send();
            } else{
                let statusCode = 400;
                if(result.message.includes('not found') || result.message.includes('unauthorized')){
                    statusCode = 404;
                } else if (result.message.includes('Internal Server Error')){
                    statusCode = 500;
                }
                res.status(statusCode).json({success: false, errors: [result.message]});
            }
        } catch (error) {
            res.status(500).json({success: false, error: "Internal Server Error"});
        }
    },
    getSummary: async(req, res)=>{
        try {
            const validationResult = validateStatsQuery(req.body);
            if(!validationResult.isValid){
                return res.status(400).json({success: false, errors: validationResult.errors});
            }
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const result = await moneyTrackerService.getMonthlySummary(req.user._id, year);
            res.status(200).json({success: true, data: result.data});
        } catch (error) {
            res.status(500).json({success: false, error: "Internal Server Error"});
        }
    },
    updateLimitSettings: async(req, res) =>{
        try {
            const validationResult = validateSetLimit(req.body);
            if(!validationResult.isValid){
                return res.status(400).json({success: false, errors: validationResult.errors});
            }
            const result = await moneyTrackerService.updateDailyLimit(req.user._id, req.body);
            if(result.success){
                res.status(200).json({success: true, data: result.data});
            } else{
                let statusCode = 400;
                if(result.message.includes('not found')){
                    statusCode = 400;
                } else if(result.message.includes('Internal Server Error')){
                    statusCode = 500;
                }
                res.status(statusCode).json({success: false, errors: [result.message]});
            }
        } catch (error) {
            res.status(500).json({success: false, error: "Internal Server Error"});
        }
    }
}