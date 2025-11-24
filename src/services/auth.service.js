    import { GET_DB } from "../config/db.js";
    import { ObjectId, ReturnDocument } from "mongodb";
    import { validateLogin,  validateRegister, hashPassword, comparePassword} from "../utils/validators.js";
    import { genToken } from "../utils/jwt.js";
    import { USER_ROLES } from "../constants/roles.js";

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
                console.error('Failed', error);
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
                    role: USER_ROLES.USER,
                    created_at: new Date(), 
                    updated_at: new Date()  
                }
                
                const result = await this.collection.insertOne(user);
                const userId = result.insertedId.toString();

                const token = genToken(userId, user.role);

                return {
                    success: true,
                    data: {
                        user:{
                            id: userId,
                            name: user.name,
                            email: user.email,
                            role: user.role
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
                const token = genToken(userId, user.role);

                return {
                    success: true,
                    data: {
                        user: {
                            id: userId, 
                            name: user.name,
                            email: user.email,
                            role: user.role
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
                if(!ObjectId.isValid(userId)){
                    return null;
                }
                const user = await this.collection.findOne(
                    { _id: new ObjectId(userId) },
                    { projection: { password: 0 } }
                );
                return user;
            } catch (error) {
                console.error("Lay user bang id loi", error);
                return null;
            }
        }
        async getAllUsers(){
            try{
                if(!this.collection) this.init();

                const users = await this.collection
                    .find({}, {projection: {password: 0}})
                    .sort({created_at: -1})
                    .toArray();

                return {success: true, data: users};
            } catch(error){
                return{success: false, errors: 'Error'};
            }
        }
        async updateUserRole(userId, newRole){
            try{
                if(!this.collection) this.init();

                if(!ObjectId.isValid(userId)){
                    return {success: false, errors: ['ID nguoi dung khong hop le']};
                }

                const result = await this.collection.findOneAndUpdate(
                    {_id: new ObjectId(userId)},
                    {
                        $set:{
                            role: newRole,
                            updated_at: new Date()
                        }
                    },
                    {returnDocument: 'after', projection: {password: 0}}
                )

                if(!result.value){
                    return{success: false, errors: ['Nguoi dung khong ton tai']};
                }

                return {success: true, data: result.value};
            } catch(error){
                console.error("Loi update UserRole", error);
                return{success: false, errors: ['Loi cap nhat vai tro']};
            }
        }
    }

    export const authService = new AuthService();