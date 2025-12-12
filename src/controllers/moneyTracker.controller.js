import { moneyTrackerService } from "../services/moneyTracker.service.js";
import { validateCategory,  validateTransaction, validateSetLimit, validateStatsQuery } from "../utils/validators.js";
export const moneyTrackerController = {
    createCategory: async (req, res) => {
        try {
            const validation = validateCategory(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    errors: validation.errors
                });
            }
            const result = await moneyTrackerService.createCategory(req.body, req.user._id);
            if (result.success) {
                return res.status(201).json({
                    success: true,
                    data: result.data
                });
            }
            return res.status(400).json({
                success: false,
                errors: [result.message]
            });
        } catch (error) {
            console.error("createCategory error:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    },
    getCategories: async (req, res) => {
        try {
            const result = await moneyTrackerService.getCategoryByUserId(req.user._id);
            return res.json({
                success: true,
                data: result.data || []
            });
        } catch (error) {
            console.error("getCategories error:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    },
    createTransaction: async (req, res) => {
        try {
            const validation = validateTransaction(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    errors: validation.errors
                });
            }
            const result = await moneyTrackerService.createTransaction(req.body, req.user._id);
            if (result.success) {
                return res.status(201).json({
                    success: true,
                    data: result.data
                });
            }
            return res.status(400).json({
                success: false,
                errors: [result.message]
            });
        } catch (error) {
            console.error("createTransaction error:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    },
    getTransactions: async (req, res) => {
        try {
            const validation = validateStatsQuery(req.query);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    errors: validation.errors
                });
            }
            const result = await moneyTrackerService.getTransactionsWithFilters(
                req.user._id,
                req.query
            );
            return res.json({
                success: true,
                data: result.data
            });
        } catch (error) {
            console.error("getTransactions error:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    },
    deleteTransaction: async (req, res) => {
        try {
            const result = await moneyTrackerService.deleteTransactionById(
                req.params.transactionId,
                req.user._id
            );
            if (result.success) {
                return res.json({
                    success: true,
                    message: result.message
                });
            }
            return res.status(404).json({
                success: false,
                errors: [result.message]
            });
        } catch (error) {
            console.error("deleteTransaction error:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    },
    getSummary: async (req, res) => {
        try {
            const year = parseInt(req.query.year) || new Date().getFullYear();

            const result = await moneyTrackerService.getMonthlySummary(req.user._id, year);
            return res.json({ success: true, data: result.data });
        } catch (error) {
            console.error("getSummary error:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    },
    updateLimitSettings: async (req, res) => {
        try {
            const validation = validateSetLimit(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    errors: validation.errors
                });
            }
            const result = await moneyTrackerService.updateDailyLimit(
                req.user._id,
                req.body
            );
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data
                });
            }
            return res.status(400).json({
                success: false,
                errors: [result.message]
            });
        } catch (error) {
            console.error("updateLimitSettings error:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
};