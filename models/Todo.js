import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // tai su dung model User
        required: true 
    }
});

export default mongoose.model('Todo', userSchema);