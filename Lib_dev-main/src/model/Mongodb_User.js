require('dotenv').config();
const client = require('../config/Mongoo_DB');
const bcrypt = require('bcrypt');
 
const register = async(Account) =>  {
    
    try{
    await client.connect();
    const New_User = await client.db(process.env.NAME_DATABASE).collection("User").insertOne(Account);
    return New_User.insertedId;
    }catch(err){
        console.log("Lỗi REGISTER", err);
        return false;
    }

}
const checkEmail = async(Email) => {
    await client.connect();

    try{
    return await client.db(process.env.NAME_DATABASE).collection("User").findOne({ Email: Email });
    }
    catch(err){
        console.log("Lỗi CheckEmail", err);
        return false;
    }
}
const Login = async (Email, Password) => {
    await client.connect();
    try{
        return await client.db(process.env.NAME_DATABASE).collection('User').findOne({Email: Email, Password: Password});
    }catch(err){
        console.log("Lỗi Login", err);
        return false;
    }
  };
module.exports = {
    register,
    checkEmail,
    Login,
};