const theProduct = require('../model/Mongodb_Product');
const fs = require('fs');
const path = require('path');

const AddProducts = async (req, res, next) => {
    const { name, thePrice, type, describe, quanlity } = req.body;
    const image = req.file; // Lấy file ảnh từ request

    try {
        const userId = req.session.userData._id;
        const userName = req.session.userData.UserName;

        if (!userId) {
            return res.status(401).redirect('/Error'); 
        }

        if (!name || !thePrice || !image || !type || !describe || !quanlity) {
            req.flash('error', 'Lỗi không nhận dữ liệu ');
            return res.redirect('/addProduct');
        }
        if (thePrice < 0) {
            req.flash('error', 'Giá sản phẩm phải lớn hơn 0');
            return res.redirect('/addProduct');
        }
        const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(thePrice);

        // Đọc file ảnh và chuyển đổi sang dạng Buffer
        const imageData = fs.readFileSync(image.path);

        const theProducts = { 
            name, 
            price,
            type, 
            describe, 
            userName, 
            userId, 
            quanlity,
            image: {
                data: imageData,
                contentType: image.mimetype
            }
        };

        const newProduct = await theProduct.AddProduct(theProducts);
        if (newProduct) {
            req.flash('success', 'Sản phẩm đã được thêm vào');
            console.log(`Đã thêm sản phẩm ${name} vào website ${price}`);
            
            return res.redirect('/yourStore');
        }

    } catch (err) {
        console.log("Lỗi addProduct(Controller): ", err);
        return res.status(500).redirect('/Error'); 
    }
};const listProducts = async (req, res) => {
    try {
        const productList = await theProduct.listProduct(); 
        res.render('ShopPage', { productList });
    } catch (err) {
        console.log("Error in listProducts(Controller): ", err);
        return res.status(401).redirect('/Error'); 
    }
};

const Find_type_PRODUCT = async (req, res) => {
    try {
        const type_product = req.query.type_product;
        let getType;
        switch (type_product) {
            case 'shirt': 
                getType = 'shirt';
                break;
            case 'coats': 
                getType = 'coats';
                break;
            case 'pants': 
                getType = 'pants';
                break;
            case 'hat':
                getType = 'hat';
                break;
            case 'watch': 
                getType = 'watch';
                break;
            case 'shoes': 
                getType = 'shoes';
                break;
            case 'bag':
                getType = 'bag';
                break;
            case 'outfit':
                getType = 'outfit';
                break;
            case 'dress': 
                getType = 'dress';
                break;
            default:
                getType = 'all';
                break;
        }
        const productList = await theProduct.findType(getType);
        console.log('Product List:', productList);

        res.render('typeProduct', { 
            productList: productList || [],
            type_product: type_product,
        });
    } catch (err) {
        console.log("Error in Find_type_PRODUCT(Controller): ", err);
        return res.status(500).redirect('/Error');
    }
};

const in4_Products = async (req, res) => {
    try {
        const _id  = req.params._id;
        const product = await theProduct.in4Product(_id);
        if (!product) {
            return res.status(404).send("Product not found");
        }
        res.render('in4_Product', { 
            name: product.name,
            price: product.price,
            image: product.image,
            type: product.type,
            describe: product.describe,
            _id: product._id,
            avgRate: product.averageRating,
            userName: product.userName,
            comments: product.comments,
            quanlity: product.quanlity,
            userId: product.userId,
            original_price: product.original_price,
            Sale: product.Sale,
        });
    } catch (err) {
        console.log("Lỗi in4_Product(Controller): ", err);
        return res.status(401).redirect('/Error'); 
    }
}
const getRate = async (req, res) => {
    try {
        const _id = req.params._id; 
        const userId = req.session.userData._id; 
        const product = await theProduct.in4Product(_id); 
        
        if (!product) {
            return res.status(404).send("Product not found");
        } else {
            const checkRat = await theProduct.get_Product(_id); 
            const checkuser = await theProduct.checkRate(userId, _id); 
            
            if (!checkuser) {
                req.flash('error', 'Bạn chưa mua sản phẩm nên không thể đánh giá');
                return res.redirect(`/theProduct/${_id}`);
            }
            
            if (checkRat && checkRat.comments && checkRat.comments.some(comment => comment.userId === userId)) {
                req.flash('error', 'Bạn đã đánh giá sản phẩm này rồi');
                return res.redirect(`/theProduct/${_id}`);
            }

            res.render('RateProduct', { 
                name: product.name,
                image: product.image,
                _id: product._id,
            });
        }
    } catch (err) {
        console.log("Lỗi getRate (Controller): ", err);
        return res.status(500).send("Internal Server Error");
    }
}


const rateTheProduct = async (req, res) => {
    const { _id } = req.params;
    const { rate, comments } = req.body;

    try {
        //Kiểm tra n dừng đa đng nhập hay chưa 
        const userId = req.session.userData._id;
        const userName = req.session.userData.UserName; // lấy tên ngừoi dùng sau khi đã đăng nhập 

        if (!userId) {
            return res.status(401).redirect('/Error'); 
        }
    
        const rating = parseFloat(rate);    
        const newRate = await rateProduct(_id, userId, userName, rating, comments);

        if (newRate) {
            req.flash('success', 'Rating submitted successfully');
            return res.redirect(`/theProduct/${_id}`);
        } else {
            req.flash('error', 'Failed to rate the product');
            return res.redirect(`/Product/Rate/${_id}`);
        }
    } catch (err) {
        console.error("Error in rateTheProduct(Controller): ", err);
        req.flash('error', 'Failed to rate the product');
        return res.redirect(`/Error`);
    }
};
const wareHouses = async (req, res) => {
    try {
        const user_Id = req.session.userData._id; 
        const yourStores = await theProduct.wareHouse(user_Id);

        if (!yourStores ) {
            console.log('No stores found for user:', user_Id);
            req.flash('error', 'No products found in your warehouse');
            return res.redirect('/wareHouses');
        }
        
        res.render('wareHouses', { 
            warehouses: yourStores
        });

    } catch (err) {
        console.error("Error in wareHouses(Controller): ", err);
        req.flash('error', 'Failed to retrieve your warehouse data');
        return res.redirect('/Error');
    }
};
const Del_products = async (req, res) => {
    const { _id } = req.params; 
    const user_Id = req.session.userData._id;

    try {
        if (!user_Id) {
            return res.status(401).redirect('/Error');
        }
        const productDeleted = await theProduct.Del_product(_id);
        if (productDeleted) {
            req.flash('success', 'Sản phẩm đã được xóa');
            return res.redirect('/wareHouses');
        } else {
            console.log("Failed to delete product");
            req.flash('error', 'Failed to delete product');
            return res.redirect('/wareHouses');
        }
    } catch (err) {
        console.log("Error in Del_products (controller): ", err);
        return res.status(500).redirect('/Error'); // Changed to 500 for server error
    }
}
const Update_products = async (req, res) => {
    const { _id } = req.params; // Corrected the destructuring
    const user_Id = req.session.userData._id;
    const { name, updatePrice, describe, quanlity} = req.body;

    try {
        if (!user_Id) {
            return res.status(401).redirect('/Error');
        }
        const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(updatePrice); 
        const in4_Product = {name, price, describe, quanlity};
        const productUpdated = await theProduct.Update_product(_id, in4_Product);
        if (productUpdated) {
            req.flash('success', 'Sản phẩm đã được cập nhật');
            return res.redirect('/wareHouses');
        } else {
            console.log("Failed to update product");
            req.flash('error', 'Failed to update product');
            return res.redirect('/wareHouses');
        }
    } catch (err) {
        console.log("Error in Update_products (controller): ", err);
        return res.status(500).redirect('/Error'); // Changed to 500 for server error
    }   
}
const get_a_Product = async (req, res) => {
    const { _id } = req.params;
    const user_Id = req.session.userData._id;

    try {
    if(!user_Id){
        console.log("Lôĩ ở phần xác nhận Get Product");
    } 
        const product = await theProduct.get_Product(_id);
        if (!product) {
            return res.status(404).send("Sản phẩm ko tồn tại");
        }
        res.render('updateProduct', { 
            _id: product._id,
            name: product.name,
            price: product.price,
            //image: product.image,
            quanlity: product.quanlity,
            type: product.type,
            describe: product.describe,
        });
    } catch (err) {
        console.log("Lỗi get_a_Product(Controller): ", err);
        return res.status(401).redirect('/Error'); 
    }
}
const getSale = async(req, res, next) => {
    const { _id } = req.params;
    const user_Id = req.session.userData._id;
    if(!user_Id){
        console.log("L��i hệ thống xác nhận ngừoi dùng");
        return res.redirect('/wareHouses');
    }
    const product = await theProduct.get_Product(_id);
    if (!product) {
        return res.status(404).send("Sản phẩm ko tồn tại");
    }
    res.render('saleProduct', {
        _id: product._id,
        name: product.name,
        price: product.price,

    });
}
const Sale_Product = async(req, res, next) => {
    try{
        const { _id } = req.params;
        const user_Id = req.session.userData._id;
        const {sale} = req.body;
        if(!user_Id){
            console.log("Lỗi hệ thống xác nhận ngừoi dùng");
            return res.redirect('/wareHouses');

        }
        const infoProduct = await theProduct.in4Product(_id);
        if(infoProduct.Sale){
            req.flash('error', 'Vui lòng khôi phục lại giá sản phẩm trước khi giảm tiếp');
            return res.redirect(`/SaleProduct/${_id}`);

        }
        const Sale_it = await theProduct.sale_product(_id, sale);
        if(!Sale_it){
            console.log("L��i khi giảm giá sản phẩm");
            req.flash('error', 'Lỗi giảm giá sản phẩm');
            return res.redirect(`/SaleProduct/${_id}`);
            
        }
        req.flash('success', 'Giảm giá thành công');
        return res.redirect('/wareHouses');

    }catch(err){
        console.log("Error in Sale_Product(Controller): ", err);
        return res.status(500).redirect('/Error'); 

    }
}
const Responsice_Sales = async(req, res) => {
    try{
        const {_id} = req.params;
        const user_Id = req.session.userData._id;
            if(!user_Id){
            console.log("L��i hệ thống xác nhận ngừoi dùng");
            return res.redirect('/wareHouses');
        }
        const responsice_product = await theProduct.Responsice_Sale(_id);
        if(!responsice_product){
            console.log("Lỗii khi trả lại sản phẩm");
            req.flash('error', 'Failed to responsice product');
            return res.redirect(`/wareHouses`);
        }
        console.log("Responsice success");
        req.flash('success','Khôi phục giá gốc thành công');    
        return res.redirect(`/wareHouses`);


    }catch(err){
        console.log("Error in Responsice_Sales(Controller): ", err);
        return res.status(500).redirect('/Error');  
    }
}
module.exports = {
    listProducts, 
    AddProducts,
    Find_type_PRODUCT,
    in4_Products, 
    rateTheProduct, 
    getRate , 
    wareHouses, 
    Del_products, 
    get_a_Product, 
    Update_products, 
    Sale_Product, 
    getSale,
    Responsice_Sales,
};