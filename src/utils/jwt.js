import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN

export const genToken = (userID) => {
    return jwt.sign(
        {user_id: userId},
        JWT_SECRET,
        {expiresIn: JWT_EXPIRES_IN}
    );
};

export const verifyToken = (token) => {
    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        return {success: true, data: decoded};
    } catch(error){
        return {success: false, error: error.message};
    }
}

export const getUserIdFromToken = (token) =>{
    const result = verifyToken(token);
    if(result.success){
        return result.data.user_id;
    }
    return null;
}