import mongoose from 'mongoose';

const CategorySchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Income', 'Expense'],
        required: true
    },
    ownerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
},{
    timestamps: true,
});

CategorySchema.index({ownerId: 1, type: 1, name: 1}, {unique: true});

const CategoryModel = mongoose.model('Category', CategorySchema);
export default CategoryModel;