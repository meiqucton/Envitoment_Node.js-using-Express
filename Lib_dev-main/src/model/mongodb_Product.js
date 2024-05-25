require('dotenv').config();
const client = require('../config/Mongoo_DB');
const { ObjectId } = require('mongodb');

 
 
const AddProduct = async (theProducts) => {
    try {
        await client.connect();
        
        const newProduct = await client.db(process.env.NAME_DATABASE).collection("Products").insertOne(theProducts);
        return newProduct.insertedId;
    } catch (err) {
        console.log("Lỗi addProduct(model): ", err);
        return false;
    }
}

const listProduct = async () => {
    try{
    const Pruduct = await client.db(process.env.NAME_DATABASE).collection("Products");
    return await Pruduct.find().toArray();
    }catch(err){
        console.log("Lỗi listProduct(model): ", err);
        return false;
    }
}
module.exports = {listProduct , AddProduct};