require('dotenv').config();
const client = require('../config/Mongoo_DB');
const { ObjectId } = require('mongodb');

 
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
const Login = async (Email, Password) => {
        await client.connect();
        try{
            return await client.db(process.env.NAME_DATABASE).collection('User').findOne({Email: Email, Password: Password});
        }catch(err){
            console.log("Lỗi Login", err);
            return false;
        }
    };
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
  
const forgotPassword = async (Email) => {
    await client.connect();
    try{
        return await client.db(process.env.NAME_DATABASE).collection('User').findOne({Email: Email});
    }
    catch(err){
        console.log("Lỗi forgotPassword", err);
        return false;
    }
}
const in4User = async (user_Id) => {
    await client.connect();
    try{
        const user_Idd = new ObjectId(user_Id);
        return await client.db(process.env.NAME_DATABASE).collection('User').findOne({_id: user_Idd});
    }
    catch(err){
        console.log("Lỗi in4User", err);
        return false;
    }
}
const updateAdress = async (userId , country, city, conscious, stressName, phoneNumber )  => {
    await client.connect();
    try{
        const user_Id = new ObjectId(userId);
        const updatedUser = await client.db(process.env.NAME_DATABASE).collection('User').updateOne(
            {_id: user_Id}, {
            $push: {
                address: {
                    country,
                    city,
                    conscious,
                    stressName,
                    phoneNumber,
                }
            },
        });
        return updatedUser.matchedCount > 0;
    }
    catch(err){
        console.log("L��i updateAdress", err);
        return false;
    }

}


module.exports = {
    register,
    checkEmail,
    Login,
    forgotPassword,
    in4User,
    updateAdress,
};