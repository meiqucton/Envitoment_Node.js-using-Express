const  Mg_Oder = require('../model/mongodb_Oder');
const Mg_product = require('../model/mongodb_Product');
const Mg_user = require('../model/Mongodb_User');
const confirmEmail = require('../config/Send_Mail');

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const get_buy = async (req, res, next) => {
    const { _id } = req.params;
    

    if (req.session && req.session.userData) {
        const user_Id = req.session.userData._id;
        const address = req.session.userData.address;
        const voucher = req.session.userData.Voucher;

        try {
            if (!user_Id) {
                console.log("Lỗi ở phần xác nhận người mua");
                return res.status(401).redirect('/Error');
            }

            if (!address) {
                req.flash('error', 'Vui lòng cập nhật địa chỉ');
                return res.redirect(`/Mg_product/${_id}`);
            }
            const product = await Mg_product.in4Product(_id);
            if (!product) {
                return res.status(404).send("Sản phẩm không tồn tại");
            } else {
                if (isNaN(product.quanlity)) {
                    req.flash('error', 'Sản phẩm đã hết hàng');
                    return res.redirect(`/Mg_product/${_id}`);
                }
                res.render('buyProduct', {
                    _id: product._id,
                    name: product.name,
                    quanlity: product.quanlity,
                    type: product.type,
                    Address: address,
                    Voucher: voucher,
                });
            }
        } catch (err) {
            console.log("Lỗi get_buy (Controller): ", err);
            return res.status(500).redirect('/Error');
        }
    } else {
        console.log("Session hoặc userData không tồn tại");
        res.status(401).send("Unauthorized");
    }
};
const buy_function = async (req, res) => {
    if (req.session && req.session.userData) {
        try {
            const _id = req.params._id;
            const id_user = req.session.userData._id;
            const name_user = req.session.userData.UserName;
            const addresses = req.session.userData.address;
            const voucher = req.session.userData.Voucher;
            let discount = 0;
            const { size, theQuanlity, product_name, address_index, voucher_index } = req.body;
            const selectedAddress = addresses[address_index];
            const selecrtVoucher = voucher[voucher_index];

            if (!id_user || !name_user) {
                console.log('Lỗi hệ thống: Không xác nhận được người dùng mua');
                return res.status(401).redirect('/Error');
            }

            const product = await Mg_product.get_Product(_id);
            if (!product) {
                return res.status(404).send("Sản phẩm không tồn tại");
            }

            const type = product.type;

            if (selecrtVoucher) { 
               
                 
                if (type !== selecrtVoucher.type && selecrtVoucher.type !== 'all') {
                        req.flash('error', 'Mã giảm giá không hợp lệ với loại sản phẩm này');
                        return res.redirect(`/Product/Buy/${_id}`);
                }
                discount = selecrtVoucher.discount;
            } else {
                discount = 0;
            }
            
            const updatedQuantity = product.quanlity - theQuanlity;
            const updatedProduct = await Mg_product.Update_product(_id, { quanlity: updatedQuantity });
            if (!updatedProduct) {
                console.log('Lỗi hệ thống: Không thể cập nhật số lượng sản phẩm');
                return res.status(500).redirect('/Error');
            }

            const emailForBuyProduct = await Mg_user.in4User(id_user);
            if (!emailForBuyProduct) {
                console.log('Lỗi hệ thống: Không tìm thấy email của người dùng');
                return res.status(500).send("Lỗi hệ thống email");
            }

            const token = jwt.sign({ _id, id_user, name_user, product_name, type, size, theQuanlity, selectedAddress, discount }, 'secret', { expiresIn: '1h' });

            const confirmationUrl = `${req.protocol}://${req.get('host')}/confirmPurchase/${token}`;
            
            await confirmEmail.sendEmail(emailForBuyProduct.Email, 'Xác nhận mua hàng', 
            `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Xác nhận mua hàng</title>
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
                <link href="/css/mailOTP.css" type="text/css" rel="stylesheet">
            </head>
            <body>
                <div class="container">
                    <h2>Xác nhận mua hàng</h2>
                    <p>Xin chào ${name_user},</p>
                    <p>Bạn đã đặt mua sản phẩm <strong>${product.name}</strong>. Vui lòng bấm vào nút bên dưới để xác nhận mua hàng.</p>
                    <a href="${confirmationUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Xác nhận mua hàng</a>
                </div>
            </body>
            </html>`
            );

            req.flash('success', 'Vui lòng check Email để xác nhận mua hàng');
            return res.redirect(`/Mg_product/${_id}`);
        } catch (err) {
            console.log("Lỗi trong buy_function (Controller):", err);
            return res.status(500).redirect('/Error');
        }
    } else {
        console.log("Session hoặc userData không tồn tại");
        return res.status(401).send("Unauthorized");
    }
};

const confirmProduct = async(req, res) => {
    try{
        const token = req.params.token;
        const getJWT = jwt.verify(token, 'secret');
        const {_id, id_user, name_user, product_name ,type,size, theQuanlity, selectedAddress, discount} = getJWT;
        if (!selectedAddress) {
            console.log('Lỗi hệ thống: Không thể tìm thấy địa chỉ đã chọn');
            return res.status(400).send("Lỗi hệ thống địa chỉ");
        }
        const product = await Mg_Oder.buy_Product(_id, id_user, name_user, product_name,type ,size, theQuanlity, selectedAddress, discount);
        const getIn4_Product = await Mg_product.get_Product(_id);
        const UP_Quanlity = getIn4_Product.quanlity - theQuanlity;
        const updateSales = getIn4_Product.sales + theQuanlity;
        console.log('cập nhật danh sách bán chạy thành công: ', updateSales);
        const updatedQuantity = await Mg_product.Update_product(_id, {quanlity: UP_Quanlity, sales: updateSales}, );
        if(!updatedQuantity){
            req.flash('error','Cập nhật sản phẩm thất bại');
            return res.redirect(`/Mg_product/${_id}`);
        }
        console.log('Cập nhật thành công');
        if(!product){
            req.flash('error','Mua Hàng thất bại');
            return res.redirect(`/Mg_product/${_id}`);
        }
        else{
            
            req.flash('success', "mua hàng thành công");
            return res.redirect(`/Mg_product/${_id}`);
        }
    }catch(err){
            console.log("L��i trong confirmProduct (Controller):", err);
            req.flash('error', "Xác nhận mua hàng thất bại");
            return res.redirect(`/err`);
    
    }
}

const functionGetOderProduct = async (req, res) => {
    if (req.session && req.session.userData) {
        const _id = req.params._id;
        const id_user = req.session.userData._id;

        try {
            if (!id_user) {
                console.log("Lỗi ở phần xác nhận người mua");
                return res.status(401).redirect('/Error');
            }

            const theproductOder = await Mg_Oder.getOderProduct(_id);
            if (!theproductOder) {
                console.log("Lỗi lấy đơn hàng của người dùng");
                return res.status(404).send("Đơn hàng không tồn tại");
            }

            res.render('oderManagement', {
                theproductOder,
            });
        } catch (err) {
            console.log("Lỗi functionGetOderProduct (Controller): ", err);
            return res.status(500).redirect('/Error');
        }
    } else {
        console.log("Session hoặc userData không tồn tại");
        res.status(401).send("Unauthorized");
    }
};
const your_Product = async (req, res) => {
    try {
        const id_user = req.session.userData._id;
        if (!id_user) {
            console.log("Error: User ID not found");
            return res.status(400).send("User ID not found");
        } else {
            const theYourProducts = await Mg_Oder.yourProduct(id_user);
            res.render('yourProduct', { 
                theYourProducts,
            });
        }
    } catch (err) {
        console.log("Error in yourProduct (Controller): ", err);
        res.status(500).send("Internal Server Error");
    }
    }
const controller_suggested_price = async (req, res) => {
        try {
            const priceRange = req.query.priceRange;
            let min, max;
    
            switch (priceRange) {
                case 'low':
                    min = 0;
                    max = 100000;
                    break;
                case 'medium':
                    min = 100000;
                    max = 200000;
                    break;
                case 'high':
                    min = 200000;
                    max = 500000;
                    break;
                case 'highPlush':
                    min = 500000;
                    max = 1000000;
                    break;
                case 'highPromax':
                    min = 1000000;
                    max = 9999999999999;
                    break;
                default:
                    min = 0;
                    max = 9999999999999;
                    break;
            }
            const minPrice =  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(min);
            const maxPrice =  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(max); 
            const products = await Mg_Oder.get_suggested_price(minPrice, maxPrice);
            console.log('Min: ', minPrice);
            console.log('Max: ', maxPrice);
            if (!products) {
                res.render('ProductByPrice', {
                    products: [],
                    priceRange: priceRange,
                });
            } else {
                res.render('ProductByPrice', {
                    products: products,
                    priceRange: priceRange,
                });
            }
        } catch (err) {
            console.log("Error controller_suggested_price(Controller): ", err);
            return res.status(500).redirect('/Error');
        }
    };
    
module.exports = { 
    buy_function,
    get_buy, 
    functionGetOderProduct,
    your_Product, 
    confirmProduct,
    controller_suggested_price,
    
    };
