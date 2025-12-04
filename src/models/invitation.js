import mongoose from "mongoose";

const InvitationSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Group',
    },
    invitedUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    inviterId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',  
    },
    inviteeEmail:{
        type: String,
        required: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    status:{
        type: String,
        enum: ["pending", "accepted", "rejected", "cancelled"],
        default: "pending",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    acceptedAt:{
        type: Date,
    },
    rejectedAt:{
        type: Date,
    },
    cancelledAt:{
        type: Date,
    },
}, {
    versionKey: false,
    timestamps: true
});

const InvitationModel = mongoose.model('Invitations', InvitationSchema);
export default InvitationModel;