import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
}

export const genToken = (payload) => {
    return jwt.sign(
        { userId: payload.userId, role: payload.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { success: true, data: decoded };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getUserIdFromToken = (token) => {
    const result = verifyToken(token);
    if (result.success) {
        return result.data.userId;
    }
    return null;
};
