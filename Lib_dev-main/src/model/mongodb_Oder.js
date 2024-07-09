require('dotenv').config();
const client = require('../config/Mongoo_DB');
const { ObjectId } = require('mongodb');

const buy_Product = async (Product_id, id_user, name_user, product_name, size, theQuanlity, Address) => {
    try {
        const db = client.db(process.env.NAME_DATABASE);
        const productId = new ObjectId(Product_id);

        const product = await db.collection("Products").findOne({ _id: productId });

        if (!product) {
            return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
        }

        if (product.quanlity < theQuanlity) {
            return res.status(400).json({ error: 'Số lượng sản phẩm không đủ' });
        }
        const total_amount = product.price * theQuanlity;

        const newQuality = product.quanlity - theQuanlity;
        await db.collection("Products").updateOne({ _id: productId }, { $set: { quanlity: newQuality } });// trừ số luượng sản phẩm 

        const newOrder = await db.collection("yourOrder").insertOne({
            Product_id: productId,
            id_user,
            name_user,
            product_name,
            size,
            quanlity: theQuanlity,
            Address,
            total_amount, 
            orderDate: new Date()
        });

        return newOrder.insertedId;
    } catch (err) {
        console.error("Error in buy_Product(Controller): ", err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
const getOderProduct = async(productId) => {
    try{
        const db = client.db(process.env.NAME_DATABASE);
        const product_Id = new ObjectId(productId);
        return await db.collection("yourOrder").find({ Product_id: product_Id }).toArray();
    
    }catch(err){
        console.log("Lôĩ oderMangerment(Controller): ", err);
        return res.status(401).redirect('/Error');
    }

};
const yourProduct = async(userId) => {
    try {
        const db = client.db(process.env.NAME_DATABASE);
        return await db.collection("yourOrder").find({ id_user: userId }).toArray();
    } catch(err) {
        console.log("Loi yourProduct(Controller): ", err);
        throw new Error('Database Error');
    }
}

module.exports = {
    buy_Product,
    getOderProduct,
    yourProduct,
};
