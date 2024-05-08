const client = require('../config/Mongoo_DB');

const createUser = async(Account) =>  {
  
    const New_User = await client.db("Account").collection("User").insertOne(Account);
    return New_User.insertedId;

}
const checkEmail = async(Email) => {
    return  await client.db("Account").collection("User").findOne({ Email: Email });
}
module.exports = {
    createUser,
    checkEmail
};
