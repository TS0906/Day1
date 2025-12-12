import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    canCreateTodo:{
        type: Boolean,
        default: false
    },
    canUpdateTodo: {
        type: Boolean,
        default: false
    },
    canSetPermission:{
        type: Boolean,
        default: false
    },
}, {_id: false});

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String
    },
    ownerId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },
    permissions: {
        type: [PermissionSchema],
        default: [],
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
}, {
    versionKey: false,
    timestamps: true
});

const GroupModel = mongoose.model('Groups', GroupSchema);
export default GroupModel;