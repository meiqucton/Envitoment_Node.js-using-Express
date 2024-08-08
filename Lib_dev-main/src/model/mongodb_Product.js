require('dotenv').config();
const client = require('../config/Mongoo_DB');
const { ObjectId } = require('mongodb');


const AddProduct = async (theProducts) => {
    try {
        await client.connect();
        const db = client.db(process.env.NAME_DATABASE);
        const newProduct = await db.collection("Products").insertOne(theProducts);
        return newProduct.insertedId;
    } catch (err) {
        throw new Error("Error adding product: " + err.message);
    } finally {
        await client.close();
    }
};
const listProduct = async () => {
    try {
        const db = client.db(process.env.NAME_DATABASE);
        return await db.collection("Products").find().toArray();
    } catch (err) {
        console.error("Error in listProduct(model): ", err);
        return false;
    }
};
// const findType = async(typeProduct) => {
//     try{
//         const db = client.db(process.env.NAME_DATABASE);
//         return await db.collection("Products").find({ type: typeProduct }).toArray();     
//     }catch(err){
//         console.error("Error in findType(model): ", err);
//         return false;
//     }
// }
const in4Product = async (Product_id) => {
    try {
        const db = client.db(process.env.NAME_DATABASE);
        const productId = new ObjectId(Product_id);
        return await db.collection("Products").findOne({ _id: productId });
    } catch (err) {
        console.error("Error in in4Product(model): ", err);
        return false;
    }
};

const rateProduct = async (Product_id, userId, userName, userRating, comment) => {
    try {
        const db = client.db(process.env.NAME_DATABASE);
        const productId = new ObjectId(Product_id);

        const product = await db.collection("Products").findOne({ _id: productId });

        if (!product) {
            throw new Error('Product not found');
        }

        const totalRating = (product.averageRating || 0) * (product.ratingCount || 0);
        const newRatingCount = (product.ratingCount || 0) + 1;
        const newAverageRating = (totalRating + userRating) / newRatingCount;

        const result = await db.collection("Products").updateOne(
            { _id: productId },
            {
                $set: {
                    averageRating: newAverageRating,
                },
                $inc: {
                    ratingCount: 1
                },
                $push: {
                    comments: {
                        userId: userId,
                        userName: userName,
                        userRating: userRating,
                        comment: comment,
                        createdAt: new Date(),
                    }
                }
            }
        );

        return result.modifiedCount > 0;
    } catch (err) {
        console.error("Error in rateProduct(model): ", err);
        return false;
    }
};

const wareHouse = async (find_shop) => {
    if (!find_shop) {
        console.error("Invalid userId provided");
        return [];
    }

    try {
        const db = client.db(process.env.NAME_DATABASE);
        const query = { userId: find_shop };
        return await db.collection("Products").find(query).toArray();
    } catch (err) {
        console.error("Error in wareHouse(model): ", err);
        return [];
    }
};

const Del_product = async (product_Id) => {
    try {
        const db = client.db(process.env.NAME_DATABASE);
        const productId = new ObjectId(product_Id);
        const result = await db.collection("Products").deleteOne({ _id: productId });
        return result.deletedCount > 0;
    } catch (err) {
        console.error("Error in Del_product (model): ", err);
        return false;
    }
};

const Update_product = async (product_id, in4_product) => {
    try {
        const db = client.db(process.env.NAME_DATABASE);
        const result = await db.collection("Products").updateOne(
            { _id: new ObjectId(product_id) },
            { $set: in4_product }
        );
        return result.modifiedCount > 0;
    } catch (err) {
        console.error("Error in Update_product (model): ", err);
        return false;
    }
};

const get_Product = async (product_id) => {
    try {
        const db = client.db(process.env.NAME_DATABASE);
        const productId = new ObjectId(product_id);
        return await db.collection("Products").findOne({ _id: productId });
    } catch (err) {
        console.error("Error in get_Product(model): ", err);
        return false;
    }
};
const sale_product = async (product_id, sale) => {
    try {
        const db = client.db(process.env.NAME_DATABASE);
        const productId = new ObjectId(product_id);
        const findproduct = await db.collection("Products").findOne({ _id: productId });

        if (!findproduct) {
            console.error("Product not found");
            return false;
        } else {
            const originalPrice = parseFloat(findproduct.price); // Chuyển đổi giá thành số thực
            const sale_amount = (originalPrice / 100) * sale; // Tính toán số tiền giảm giá
            const theResult = (originalPrice - sale_amount) * 1000000; // Giá sau khi giảm giá
            const result = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(theResult); // Định dạng giá sau khi giảm giá

            const sale_product_id = await db.collection("Products").updateOne(
                { _id: productId },
                { $set: { 
                    price: result , // Cập nhật giá sau khi giảm giá
                    original_price: findproduct.price, // Lưu giá gốc
                    Sale: sale, // Lưu tỉ lệ giảm giá
                }},
            );
            console.log('ssale_amount', sale_amount);
            console.log('theResult', theResult);
            return sale_product_id.modifiedCount > 0; // Trả về true nếu cập nhật thành công
        }
    } catch (err) {
        console.log("Error in sale_product function: ", err);
        return false;
    }
}

    
const Responsice_Sale = async (product_id) => {
    try{
        const db = client.db(process.env.NAME_DATABASE);
        const productId = new ObjectId( product_id);
        const findproduct = await db.collection("Products").findOne({ _id: productId });
        if(!findproduct || !findproduct.original_price){
            console.error("Product not found or original price not found");
            return false;
        }
        await db.collection("Products").updateOne(
            { _id: productId },
            { $set: { price: findproduct.original_price}, 
                     $unset : {original_price: " ", Sale: ""},
            }
        );
        return true;    

    }catch(err){
        console.error("Lỗi responsice_product", err);
    }
}
const checkRate = async (user_id, product_id) => {
    try {
        const db = client.db(process.env.NAME_DATABASE);
        const productId = new ObjectId(product_id);
        const checkUser = await db.collection("yourOrder").findOne({ id_user: user_id, Product_id: productId });
        
        if (checkUser) {
            return true; 
        } else {
            return false;
        }
    } catch (err) {
        console.error("Lỗi checkRate: ", err);
        return false; 
    }
}
const flashDeal = async () => {
    try {
        const db = client.db(process.env.NAME_DATABASE);
        const products = await db.collection('Products').find({ Sale:{ $exists: true } }).toArray();
        // exists:  Là điều kiện trong truy vấn để lấy các sản phẩm có trường Sale đã được định nghĩa.
        return products;
    } catch (err) {
        console.log("Lỗi trong flashDeal", err);
        throw err; 
    }
}
const BestSell = async()=> {
    try{
        const db = client.db(process.env.NAME_DATABASE);
        return await db.collection('Products').find({ sales: { $exists: true } }).toArray();
    }catch(err){
        console.log("Lỗi BestSell(bestSlell)");
    }
}
const bestSale_forShop = async(_id) => {
    try {
        const db = client.db(process.env.NAME_DATABASE);
        const products = await db.collection('Products').find({userId: _id, sales: { $exists: true } }).toArray();
        return products;
    } catch (err) {
        console.log("L��i bestSale_forShop", err);
        throw err; 
    }
}
const findProduct = async(search) => {
    try{
        const db = client.db(process.env.NAME_DATABASE);
        return await db.collection('Products').find({ name: { $regex: search, $options: 'i' } }).toArray(); 
    }catch(err){
        console.log("L��i findProduct", err);
        throw err;
    }
}
module.exports = {
    AddProduct,
    listProduct,
    //findType,
    in4Product,
    rateProduct,
    wareHouse,
    Del_product,
    Update_product,
    get_Product,
    sale_product,
    Responsice_Sale,
    checkRate,
    flashDeal,
    BestSell,
    bestSale_forShop,
    findProduct,
};
