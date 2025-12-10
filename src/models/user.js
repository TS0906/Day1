import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format']
    },
    password:{
        type: String,
        required: true,
        minlength: 6,
        select: false,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isDeleted:{
        type: Boolean,
        default: false,
        required: true,
    },
    dailyLimit:{
        type: Number,
        default: null,
        min: 1
    },
    limitActive:{
        type: Boolean,
        default: false
    },
},{
    versionKey: false,
    timestamps: true
});

const UserModel = new mongoose.model('User', UserSchema);
export default UserModel;