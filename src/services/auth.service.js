    import { GET_DB } from "../config/db.js";
    import { ObjectId } from "mongodb";
    import { validateLogin,  validateRegister, hashPassword, comparePassword} from "../utils/validators.js";
    import { genToken } from "../utils/jwt.js";

    class AuthService{
        constructor(){
            this.db = null;
            this.collection = null;
        }
        init() {
            try{
                this.db = GET_DB();
                this.collection = this.db.collection('users'); 
                console.log('Connected');
            } catch(error){
                console.error('Failed');
            }
        }

        async register(userData){
            try{
                if (!this.collection) this.init();
                
                const validation = validateRegister(userData);
                if(!validation.isValid){
                    return {success: false, errors: validation.errors}
                }
                const existingUser = await this.collection.findOne({
                    email: userData.email.toLowerCase()
                });
                if (existingUser){
                    return {success: false, errors: ["user da ton tai!"]}
                }
                const hashedPassword = await hashPassword(userData.password);
                const user = {
                    name: userData.name.trim(),
                    email: userData.email.toLowerCase(),
                    password: hashedPassword,
                    created_at: new Date(), 
                    updated_at: new Date()  
                }
                
                const result = await this.collection.insertOne(user);
                const userId = result.insertedId.toString();

                const token = genToken(userId);

                return {
                    success: true,
                    data: {
                        user:{
                            id: userId,
                            name: user.name,
                            email: user.email,
                        },
                        token
                    }
                }
            }catch(error){
                console.error("Dang ki that bai", error);
                return {success: false, errors: [error.message]}
            }
        }
        async login(loginData){
            try{
                if(!this.collection) this.init();
                const validation = validateLogin(loginData);
                if(!validation.isValid){
                    return{success: false, errors: validation.errors};
                }

                const user = await this.collection.findOne({
                    email: loginData.email.toLowerCase()
                });

                if(!user){
                    return {success: false, errors: ["sai thong tin dang nhap"]
                    }
                }
                const isPasswordValid = await comparePassword(loginData.password, user.password);
                if(!isPasswordValid){
                    return {success: false, errors: ["sai thong tin dang nhap"]}
                }

                const userId = user._id.toString();
                const token = genToken(userId);

                return {
                    success: true,
                    data: {
                        user: {
                            id: userId, 
                            name: user.name,
                            email: user.email,
                        }, token
                    }
                }
            } catch(error){
                console.error("Dang nhap that bai", error);
                return {success: false, errors: [error.message]};
            }
        }
        async getUserById(userId) {
            try {
                if(!this.collection) this.init();
                const user = await this.collection.findOne(
                    { _id: new ObjectId(userId) },
                    { projection: { password: 0 } }
                );
                return user;
            } catch (error) {
                console.error("Get user by id error:", error);
                return null;
            }
        }
    }

    export const authService = new AuthService();