import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    ownerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Income', 'Expense'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0.01
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    date:{
        type: Date,
        required: true
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    note:{
        type: String,
        trim: true
    },
},{
    timestamps: true,
});

//Indexes
TransactionSchema.index({ownerId: 1, date: 1});
TransactionSchema.index({ownerId: 1, type: 1});
TransactionSchema.index({ownerId: 1, categoryId: 1});

const TransactionModel = mongoose.model('Transaction', TransactionSchema);
export default TransactionModel;