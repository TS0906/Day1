import bcrypt from "bcryptjs";

export const validateRegister = (userData) => {
    const errors=[];

    if(!userData.name||userData.name.trim().length < 2) {
          errors.push("Ten qua ngan");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //ky tu dac biet
    if(!userData.email || !emailRegex.test(userData.email)){
          errors.push("email chua hop le");
    }
    if(!userData.password || userData.password.length < 6) {
          errors.push("password qua ngan");
    }
    const result = {
        isValid: errors.length === 0,
        errors: errors
    };
    return result;
}
export const validateLogin = (loginData) => {
     const errors = [];
     if(!loginData.email) errors.push("Sai tai khoan hoac mat khau");
     if(!loginData.password) errors.push("Sai tai khoan hoac mat khau");
     return{
          isValid: errors.length === 0,
          errors
     }
}
export const validateTodo = (todoData) => {
     const errors = [];
     if(!todoData.title || todoData.title.trim().length === 0)
          errors.push("Nhap task");
     return {
          isValid: errors.length === 0,
          errors
     }
}
export const hashPassword = async(password) => {
     const saltRounds = 10
     return await bcrypt.hash(password, saltRounds);
}
export const comparePassword = async (password, hashedPassword) => {
     return await bcrypt.compare(password, hashedPassword);
}