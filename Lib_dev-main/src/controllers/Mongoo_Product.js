const { AddProduct, listProduct } = require('../model/mongodb_Product');
const client= require('../config/Mongoo_DB');
const { Readable } = require('stream');

const AddProducts = async (req, res, next) => {
    await client.connect();
    const { name, price, type , image} = req.body;

    try {
        if (!name || !price || !image || !type) {
            req.flash('error', 'Vui lòng nhập đầy đủ thông tin');
            return res.redirect('/addProduct');
        }
        if(price < 0){
            req.flash('error', 'Giá sản phẩm phải lớn hơn 0');
            return res.redirect('/addProduct');
        }
        const theProducts = {name, price, image, type}

        const newProduct = await AddProduct(theProducts);
        if(newProduct)
        req.flash('success', 'Sản phẩm đã được thêm vào');
        console.log(`Đã thêm sản phẩm ${name} vào webside`)
        return res.redirect('/addProduct');
    }
    catch(err){
        console.log("Lỗi addProduct(Controller): ", err);
        return false;
    }

}
const listProducts = async (req, res) => {
    try {
        const productList = await listProduct(); // Assuming listProduct() returns an array of products
        res.render('ShopPage', { productList });
    } catch (err) {
        console.log("Error in listProducts(Controller): ", err);
        return res.status(500).send("Internal Server Error");
    }
};
module.exports = {listProducts,  AddProducts };