import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken"; 
import User from "../models/User.js";

export const register = async (req, res) => {
    try{
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ username }); // kiem tra username da ton tai chua
        if(existingUser){
            return res.status(400).json({ message: "Username da ton tai" });
        }
        const hashedPassword = await bcrypt.hash(password, 10); // ma hoa mat khau voi 10 rounds
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).json({ message: "Dang ky thanh cong" });
    } catch (error) {
        res.status(500).json({ message: "Loi server" });
    }
};

export const login = async (req, res) => {
    try{
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if(!user){
            return res.status(400).json({ message: "Username hoac mat khau khong dung" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({ message: "Username hoac mat khau khong dung" });
        }
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET, {expiresIn: '1h'} // token het han sau 1 gio
        );
        
        res.status(200).json({ 
            token,
            message: "Dang nhap thanh cong"
        });
    } catch (error) {
        res.status(500).json({ message: "Loi server" });
    }
};