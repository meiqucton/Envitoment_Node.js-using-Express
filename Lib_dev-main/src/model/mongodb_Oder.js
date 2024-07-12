require('dotenv').config();
const client = require('../config/Mongoo_DB');
const { ObjectId } = require('mongodb');

const buy_Product = async (Product_id, id_user, name_user, product_name,type,size, theQuanlity, Address, voucherCode) => {
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
        const product_price_origin = parseFloat(product.price);
        const ChangeVoucher = parseInt(voucherCode);
        console.log('ChangeVoucher', ChangeVoucher);
        const firt_total_amount = ((product_price_origin - (product_price_origin / 100 *  ChangeVoucher)) * theQuanlity * 1000) ;
        console.log("Gia sau khi giam la: ", firt_total_amount);
        const total_amount =  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(firt_total_amount); 
        const newQuality = product.quanlity - theQuanlity;
        await db.collection("Products").updateOne({ _id: productId }, { $set: { quanlity: newQuality } });

        const newOrder = await db.collection("yourOrder").insertOne({
            Product_id: productId,
            id_user,
            name_user,
            product_name,
            type,
            size,
            quanlity: theQuanlity,
            Address,
            total_amount, 
            orderDate: new Date()
        });

        return newOrder.insertedId;
    } catch (err) {
        console.error("Error in buy_Product(Controller): ", err);
        return res.status(401).redirect('/Error');
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
const get_suggested_price = async (minPrice, maxPrice) => {
    try{
    const db = client.db(process.env.NAME_DATABASE);    
    return await db.collection("Products").find({price:{ $gte: minPrice, $lte: maxPrice }}).toArray();
    }
    catch(err){
        console.log("L��i get_suggested_price(Controller): ", err);
        return false;
    }
}

module.exports = {
    buy_Product,
    getOderProduct,
    yourProduct,
    get_suggested_price,
};

