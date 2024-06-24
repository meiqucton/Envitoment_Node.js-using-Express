require('dotenv').config();
const client = require('../config/Mongoo_DB');
const { ObjectId } = require('mongodb');

const AddProduct = async (theProducts) => {
    try {
        const db = client.db(process.env.NAME_DATABASE);
        const newProduct = await db.collection("Products").insertOne(theProducts);
        return newProduct.insertedId;
    } catch (err) {
        throw new Error("Error adding product: " + err.message);
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

const findType = async (Find) => {
    try {
        const db = client.db(process.env.NAME_DATABASE);
        const query = { type: Find };
        return await db.collection("Products").find(query).toArray();
    } catch (err) {
        console.error("Error in findType(model): ", err);
        return false;
    }
};

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

module.exports = {
    AddProduct,
    listProduct,
    findType,
    in4Product,
    rateProduct,
    wareHouse,
    Del_product,
    Update_product,
    get_Product,
};
