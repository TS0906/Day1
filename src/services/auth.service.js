import UserModel from "../models/user.js";
import { ObjectId } from "mongodb";
import { validateLogin, validateRegister, hashPassword, comparePassword } from "../utils/validators.js";
import { genToken } from "../utils/jwt.js";
import { USER_ROLES } from "../constants/roles.js";

const register = async (userData) => {
    try{
        const validation = validateRegister(userData);
        if(!validation.isValid){
            return {
                success: false,
                errors: validation.errors
            };
        }
        const email = userData.email.toLowerCase().trim();
        const existingUser = await UserModel.findOne({email});
        if(existingUser){
            return {success: false, errors: {email: "Email already exists."}};
        }
        const hashedPassword = await hashPassword(userData.password);
        const user = await UserModel.create({
            name: userData.name.trim(),
            email,
            password: hashedPassword,
            role: USER_ROLES.USER,
            isDeleted: false,
        });
        return {
            success: true,
            message: "Registration successful"
        };
    } catch(error){
        console.error("Error in register service", error);
        if(error.code === 11000){
            return {success: false, errors: {email: "Email already exists."}};
        }
        throw error;
    }
};

const login = async (loginData) => {
    try{
        const validation = validateLogin(loginData);
        if(!validation.isValid){
            return {
                success: false,
                errors: validation.errors
            };
        }
        const user = await UserModel.findOne({email: loginData.email.toLowerCase()}).select('+password');
        if(!user || user.isDeleted){
            return { success: false, errors: { email: "Invalid credentials." } };
        }

        const isPasswordValid = await comparePassword(loginData.password, user.password);
        if(!isPasswordValid){
            return { success: false, errors: { password: "Invalid credentials." } };
        }

        const userId = user._id.toString();
        const token =  genToken({ userId, role: user.role });

        const userData = {
            _id: userId,
            name: user.name,
            email: user.email,
            role: user.role
        };
        return {
            success: true,
            data: {
                user: userData,
                token
            }
        };
    } catch (error){
        console.error("Error in login service:", error);
        throw error;
    }
};

const getAllUsers = async () => {
    try{
        const users = await UserModel.find({isDeleted: false})
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();
        return {success: true, data: users};
    } catch (error){
        throw error;
    }
};

const updateUserRole = async ( userId, newRole) => {
    try{
        if(!ObjectId.isValid(userId)){
            return { success: false, errors: ['Invalid user ID.'] };
        }
        if(!Object.values(USER_ROLES).includes(newRole)){
            return {success: false, errors: ['Invalid role specified.']};
        }
        const result = await UserModel.findOneAndUpdate(
            { _id: userId },
            { $set: { role: newRole } },
            { new: true }
        ).select('-password');
        if(!result){
            return { success: false, errors: {general: 'Users not found.'} };
        }
        return {success: true, data: result};
    } catch (error){
        console.error("Error in updating UserRole", error);
        throw error;
    }
};
const getUserById = async (userId) => {
    try {
        if (!ObjectId.isValid(userId)) return null;
        const user = await UserModel.findById(userId).select('-password'); 
        return user;
    } catch (error) {
        console.error("Error retrieving user by ID:", error);
        return null;
    }
};
export const authService = {
    register,
    login,
    getAllUsers,
    updateUserRole,
    getUserById
};