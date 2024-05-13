const client = require('../config/Mongoo_DB');
require('dotenv').config();
 
const register = async(Account) =>  {
    try{
    const New_User = await client.db(process.env.NAME_DATABASE).collection("User").insertOne(Account);
    return New_User.insertedId;
    }catch(err){
        console.log("Lỗi REGISTER", err);
        return false;
    }

}
const checkEmail = async(Email) => {
    try{
    return await client.db(process.env.NAME_DATABASE).collection("User").findOne({ Email: Email });
    }
    catch(err){
        console.log("Lỗi CheckEmail", err);
        return false;
    }
}
const Login = async(Email, Password) => {
    try{
        const user = await client.db(process.env.NAME_DATABASE).collection("User").findOne({Email : Email});
        if(!user){
        //Không timg thấy ngừoi Dùng
        return false;
        }
        const checkPass = await comparePassword(Password, user.Password);
        if(!checkPass){
        // Mật khẩu của tai khoản không đúng 
        return false;
        }
        return user;
    }
    catch(err){
        console.log("Lỗi Login", err);
        return false;
    }
}
module.exports = {
    register,
    checkEmail,
    Login,
};