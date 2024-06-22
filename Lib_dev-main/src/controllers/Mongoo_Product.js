const { AddProduct, listProduct, findType, in4Product, rateProduct, wareHouse, Del_product, Update_product, get_Product} = require('../model/mongodb_Product');
const { in4User } = require('../model/Mongodb_User');
const { Readable } = require('stream');


const AddProducts = async (req, res, next) => {
            const { name, price, type,image, describe} = req.body;
    //const image = req.file;
    try {
        const userId = req.session.userData._id;
        const userName = req.session.userData.UserName; // lấy tên ngừoi dùng sau khi đã đăng nhập 

        if (!userId) {
            return res.status(401).redirect('/Error'); 
        }

        if (!name || !price || !image || !type || !describe) {
                req.flash('error', 'lỗi không nhận dữ liệu ');
                    return res.redirect('/addProduct');
            }
            if(price < 0){
                req.flash('error', 'Giá sản phẩm phải lớn hơn 0');
                return res.redirect('/addProduct');
            }
            const theProducts = {name, price, image, type, describe, userName, userId}

            const newProduct = await AddProduct(theProducts);
            if(newProduct)
                req.flash('success', 'Sản phẩm đã được thêm vào');
                console.log(`Đã thêm sản phẩm ${name} vào webside`)
                    return res.redirect('/addProduct');
    
    }
    catch(err){
        console.log("Lỗi addProduct(Controller): ", err);
        return res.status(401).redirect('/Error'); 
    }

}
const listProducts = async (req, res) => {
    try {
        const productList = await listProduct(); // Assuming listProduct() returns an array of products
        res.render('ShopPage', { productList });
    } catch (err) {
        console.log("Error in listProducts(Controller): ", err);
        return res.status(401).redirect('/Error'); 
    }
};
const findTypes = async (req, res) => {
    try {
        const { type } = req.params;
        const products = await findType(type);
      
        if (!products) {
            res.render('typeProduct', { 
                products: [],
                type: type, 
            });
        } else {
            res.render('typeProduct', { 
                products: products, 
                type: type,
            });
        }
    } catch (err) {
        console.log("Lỗi findType(Controller): ", err);
        return res.status(401).redirect('/Error'); 
        }
};
const in4_Products = async (req, res) => {
    try {
        const _id  = req.params._id;
        const product = await in4Product(_id);
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
        });
    } catch (err) {
        console.log("Lỗi in4_Product(Controller): ", err);
        return res.status(401).redirect('/Error'); 
    }
}
const getRate = async (req, res) => {
    try {
        const _id  = req.params._id;
        const product = await in4Product(_id);
        if (!product) {
            return res.status(404).send("Product not found");
        }
        res.render('RateProduct', { 
            name: product.name,
            image: product.image,
            _id : product._id,
        });
    } catch (err) {
        console.log("Lỗi in4_Product(Controller): ", err);
        return false;
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
        const yourStores = await wareHouse(user_Id);

        if (!yourStores ) {
            console.log('No stores found for user:', user_Id);
            req.flash('error', 'No products found in your warehouse');
            return res.redirect('/wareHouses');
        }
        
        res.render('wareHouses', { 
            warehouses: yourStores
        });

        console.log('Warehouse data for user:', yourStores);

    } catch (err) {
        console.error("Error in wareHouses(Controller): ", err);
        req.flash('error', 'Failed to retrieve your warehouse data');
        return res.redirect('/Error');
    }
};
const Del_products = async (req, res) => {
    const { _id } = req.params; // Corrected the destructuring
    const user_Id = req.session.userData._id;

    try {
        if (!user_Id) {
            return res.status(401).redirect('/Error');
        }
        const productDeleted = await Del_product(_id);
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
    const { name, price, describe} = req.body;

    try {
        if (!user_Id) {
            return res.status(401).redirect('/Error');
        }
        const in4_Product = {name, price, describe};
        const productUpdated = await Update_product(_id, in4_Product);
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
    if(user_Id){
        console.log("Lôĩ ở phần xác nhận Get Product");
    } 
        const product = await get_Product(_id);
        if (!product) {
            return res.status(404).send("Sản phẩm ko tồn tại");
        }
        res.render('updateProduct', { 
            _id: product._id,
            name: product.name,
            price: product.price,
            //image: product.image,
            type: product.type,
            describe: product.describe,
        });
    } catch (err) {
        console.log("Lỗi get_a_Product(Controller): ", err);
        return res.status(401).redirect('/Error'); 
    }
}


module.exports = {listProducts,  AddProducts, findTypes, in4_Products, rateTheProduct, getRate , wareHouses, Del_products, get_a_Product, Update_products};