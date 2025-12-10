import bcrypt from "bcryptjs";
export const validateRegister = (userData) => {
    const errors=[];

    if(!userData.name||userData.name.trim().length < 2) {
          errors.push("Name is too short");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    if(!userData.email || !emailRegex.test(userData.email)){
          errors.push("Invalid email format");
    }
    if(!userData.password || userData.password.length < 6) {
          errors.push("Password must be at least 6 characters");
    }
    return {
          isvalid: errors.length === 0,
          errors
    };
};
export const validateLogin = (loginData) => {
     const errors = [];
     if(!loginData.email) errors.push("Incorrect email or password");
     if(!loginData.password) errors.push("Incorrect email or password");
     return{
          isValid: errors.length === 0,
          errors
     };
};
export const validateCategory = (categoryData) => {
     const errors = [];
     if(!categoryData?.name || categoryData.name.trim().length === 0){
          errors.push("Category name cannot be empty");
     }
     if(categoryData?.name && categoryData.name.length > 50){
          errors.push("Category name is too long");
     }
     if(!categoryData?.type || !['Income', 'Expense'].includes(categoryData.type)){
          errors.push("Invalid category type");
     }
     return{
          isValid: errors.length === 0,
          errors
     };
};
export const validateTransaction = (transaction) =>{
     const errors = [];
     if(!transaction?.type || !['Income', 'Expense'].includes(transaction.type)){
          errors.push("Invalid transaction type");
     }
     if(!transaction?.amount || typeof transaction.amount !== "number" || transaction.amount <= 0){
          errors.push("Amount must be a number greater than 0");
     }
     if(!transaction?.categoryId || transaction.categoryId.length !== 24){
          errors.push("Invalid category ID");
     }
     if(!transaction?.categoryId || transaction.categoryId.length !== 24){
          errors.push("Invalid category ID");
     }
     if(!transaction?.date || isNaN(Date.parse(transaction.date))){
          errors.push("Invalid transaction date");
     }
     return{
          isValid: errors.length === 0,
          errors
     };
};
export const validateSetLimit = (data) => {
     const errors = [];
     if(typeof data.dailyLimit !== "number" || data.dailyLimit <= 0){
          errors.push("Daily limit must be a number greater than 0");
     }
     if(typeof data.limitActive !== "boolean"){
          errors.push("limitActive must be either true or false");
     }
     return {
          isValid: errors.length === 0,
          errors
     };
};
export const validateStatsQuery = (query) =>{
     const errors = [];
     if(query.type && !["Income", "Expense"].includes(query.type)){
          errors.push("Invalid type filter");
     }
     if(query.categoryId && query.categoryId.length !== 24){
          errors.push("Invalid category ID");
     }
     if(query.from && isNaN(Date.parse(query.from))){
          errors.push("Invalid 'from' date");
     }
     if(query.to && isNaN(Date.parse(query.to))){
          errors.push("Invalid 'to' date");
     }
     return{
          isValid: errors.length === 0,
          errors
     };
};
export const validateTodo = (todoData) => {
     const errors = [];
     if(!todoData.title || todoData.title.trim().length === 0)
          errors.push("Nhap task");
     return {
          isValid: errors.length === 0,
          errors
     };
};

export const validateGroup = (groupData) => {
     const errors = [];

     if(!groupData?.name || groupData.name.trim().length === 0){
          errors.push("Ten nhom khong duoc de trong");
     }

     if(groupData.name && groupData.name.length > 100){
          errors.push("Ten nhom qua dai");
     }

     return {isValid: errors.length === 0, errors};
}

export const validateInvitation = (invitationData) => {
     const errors = [];

     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if(!invitationData?.email || !emailRegex.test(invitationData.email)){
          errors.push("Email khong hop le");
     }

     return {isValid: errors.length === 0, errors};
}

export const hashPassword = async(password) => {
     const saltRounds = 10
     return await bcrypt.hash(password, saltRounds);
}
export const comparePassword = async (password, hashedPassword) => {
     return await bcrypt.compare(password, hashedPassword);
}