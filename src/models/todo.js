import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null,
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    status:{
        type: String,
        required: true,
        enum: ["pending", "completed"],
        default: "pending",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    versionKey: false, 
    timestamps: true
});

const TodoModel = mongoose.model('Todo', TodoSchema);
export default TodoModel;