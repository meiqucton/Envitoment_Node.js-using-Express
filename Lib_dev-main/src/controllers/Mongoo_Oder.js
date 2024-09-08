const  Mg_Oder = require('../model/mongodb_Oder');
const Mg_product = require('../model/mongodb_Product');
const Mg_user = require('../model/Mongodb_User');
const confirmEmail = require('../config/Send_Mail');
const paypal = require('../config/Paypal(bank)');

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const get_buy = async (req, res, next) => {
    const { _id } = req.params;
    
    if (req.session && req.session.userData) {
        const user_Id = req.session.userData._id;
        const address = req.session.userData.address;
        const vouchers = req.session.userData.Voucher;

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

                // Lấy Voucher_id từ vouchers
                const voucherIds = vouchers.map(voucher => voucher.id_Store);

                // lấy các voucher có trùng với store
                const relevantVouchers = vouchers.filter(voucher => voucher.id_Store === product.userId);
              

                res.render('buyProduct', {
                    _id: product._id,
                    name: product.name,
                    quanlity: product.quanlity,
                    type: product.type,
                    Address: address,
                    Voucher: relevantVouchers, // Chỉ hiển thị các voucher phù hợp
                });
            }
        } catch (error) {
            console.log('Error: ', error);
            return res.status(500).send('Lỗi máy chủ');
        }
    } else {
        res.status(400).send('Không có dữ liệu session');
    }
};const buy_function = async (req, res) => {
    if (req.session && req.session.userData) {
        try {
            const _id = req.params._id;
            const { _id: userId, UserName: nameUser, address: addresses, Voucher: vouchers } = req.session.userData;
            const { size, theQuanlity, product_name, address_index, voucher_index, paymen_method } = req.body;

            if (!userId || !nameUser) {
                console.log('Lỗi hệ thống: Không xác nhận được người dùng mua');
                return res.status(401).redirect('/Error');
            }

            const selectedAddress = addresses[address_index];
            const selectedVoucher = vouchers[voucher_index];
            let discount = 0;
            let paymen_Method = '';

            const product = await Mg_product.get_Product(_id);
            if (!product) {
                return res.status(404).send("Sản phẩm không tồn tại");
            }

            const type = product.type;

            if (selectedVoucher) {
                if (type !== selectedVoucher.type && selectedVoucher.type !== 'all') {
                    req.flash('error', 'Mã giảm giá không hợp lệ với loại sản phẩm này');
                    return res.redirect(`/Product/Buy/${_id}`);
                }
                discount = selectedVoucher.discount;
            }

            const updatedQuantity = product.quanlity - theQuanlity;
            if (updatedQuantity < 0) {
                req.flash('error', 'Số lượng sản phẩm không đủ');
                return res.redirect(`/Product/Buy/${_id}`);
            }

            const totalPrice = product.price * theQuanlity;
            const updatedProduct = await Mg_product.Update_product(_id, { quanlity: updatedQuantity });
            if (!updatedProduct) {
                console.log('Lỗi hệ thống: Không thể cập nhật số lượng sản phẩm');
                return res.status(500).redirect('/Error');
            }

            if (paymen_method) {
                if (paymen_method === 'cod') {
                    paymen_Method = 'cod';
                } else if (paymen_method === 'paypal') {
                    const paymentJson = {
                        "intent": "sale",
                        "payer": {
                          "payment_method": "paypal"
                        },
                        "redirect_urls": {
                          "return_url": "http://yourdomain.com/success",
                          "cancel_url": "http://yourdomain.com/cancel"
                        },
                        "transactions": [{
                          "amount": {
                            "total": `${totalPrice}`,
                            "currency": "USD"
                          },
                          "description": `Mua sản phẩm: ${product_name}`
                        }]
                    };

                    paypal.payment.create(paymentJson, (error, payment) => {
                        if (error) {
                            console.log(error);
                            return res.status(500).send("Lỗi khi tạo thanh toán với PayPal");
                        }
                        for (let i = 0; i < payment.links.length; i++) {
                            if (payment.links[i].rel === 'approval_url') {
                                res.redirect(payment.links[i].href);
                            }
                        }
              });
                    return; // Return to avoid executing further code
                }
            }

            const emailForBuyProduct = await Mg_user.in4User(userId);
            if (!emailForBuyProduct) {
                console.log('Lỗi hệ thống: Không tìm thấy email của người dùng');
                return res.status(500).send("Lỗi hệ thống email");
            }

            const token = jwt.sign(
                { _id, userId, nameUser, product_name, type, size, theQuanlity, selectedAddress, discount, paymen_Method },
                'secret',
                { expiresIn: '1h' }
            );

            const confirmationUrl = `${req.protocol}://${req.get('host')}/confirmPurchase/${token}`;

            await confirmEmail.sendEmail(
                emailForBuyProduct.Email,
                'Xác nhận mua hàng',
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
                        <p>Xin chào ${nameUser},</p>
                        <p>Bạn đã đặt mua sản phẩm <strong>${product.name}</strong>. Vui lòng bấm vào nút bên dưới để xác nhận mua hàng.</p>
                        <a href="${confirmationUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Xác nhận mua hàng</a>
                    </div>
                </body>
                </html>`
            );

            req.flash('success', 'Vui lòng kiểm tra email để xác nhận mua hàng');
            res.redirect(`/theProduct/${_id}`);
     
        } catch (err) {
            console.log("Lỗi trong buy_function (Controller):", err);
            res.status(500).redirect('/Error');
        }
    } else {
        console.log("Session hoặc userData không tồn tại");
        res.status(401).send("Unauthorized");
    }
};

const confirmProduct = async(req, res) => {
    try{
        const token = req.params.token;
        const getJWT = jwt.verify(token, 'secret');
        const {_id, id_user, name_user, product_name ,type,size, theQuanlity, selectedAddress, discount, paymen_Method} = getJWT;
        if (!selectedAddress) {
            console.log('Lỗi hệ thống: Không thể tìm thấy địa chỉ đã chọn');
            return res.status(400).send("Lỗi hệ thống địa chỉ");
        }
        const product = await Mg_Oder.buy_Product(_id, id_user, name_user, product_name,type ,size, theQuanlity, selectedAddress, discount, paymen_Method);
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
// const controller_suggested_price = async (req, res) => {
//         try {
//             const type = req.query;
//             const priceRange = req.query.priceRange;
//             let min, max;
    
//             switch (priceRange) {
//                 case 'low':
//                     min = 0;
//                     max = 100000;
//                     break;
//                 case 'medium':
//                     min = 100000;
//                     max = 200000;
//                     break;
//                 case 'high':
//                     min = 200000;
//                     max = 500000;
//                     break;
//                 case 'highPlush':
//                     min = 500000;
//                     max = 1000000;
//                     break;
//                 case 'highPromax':
//                     min = 1000000;
//                     max = 9999999999999;
//                     break;
//                 default:
//                     min = 0;
//                     max = 9999999999999;
//                     break;
//             }
//             const minPrice =  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(min);
//             const maxPrice =  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(max); 
//             const products = await Mg_Oder.get_suggested_price(type ,minPrice, maxPrice);
//             console.log('Min: ', minPrice);
//             console.log('Max: ', maxPrice);
//             if (!products) {
//                 res.render('ProductByPrice', {
//                     products: [],
//                     priceRange: priceRange,
//                 });
//             } else {
//                 res.render('ProductByPrice', {
//                     products: products,
//                     priceRange: priceRange,
//                 });
//             }
//         } catch (err) {
//             console.log("Error controller_suggested_price(Controller): ", err);
//             return res.status(500).redirect('/Error');
//         }
//     };
const findProduct = async (req, res) => {
    const typeRange = req.query.type;
    const priceRange = req.query.priceRange;
    let min, max;
    let finalType;

    try {
        const optionTypes = ['shirt', 'coats', 'pants', 'hat', 'watch', 'shoes', 'bag', 'outfit', 'dress'];
        if (optionTypes.includes(typeRange)) {
            finalType = typeRange;
        }

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
        console.log('Min:', minPrice);
        console.log('Max:', maxPrice);
        console.log('getType:', finalType);
        console.log('type:', typeRange);

        const products = await Mg_Oder.findProduct(finalType, minPrice, maxPrice);
            
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
        console.log("Error findProduct(Controller):", err);
        return res.status(500).redirect('/Error');
    }
};
const customer_Consulting = async (req, res) => {
    try{
        const id_user = req.session.userData._id;
        if (!id_user) {
            console.log("Error: User ID not found");
            return res.status(400).send("User ID not found");
        }
        const getIn4 = await Mg_user.in4User(id_user);
        res.render('Consulting', { 
            getIn4,
        });
    }catch(err){
        console.log("L��i trong customer_Consulting (Controller):", err);
        req.flash('error', "L��i gặp phải khi thông tin tư vấn");
        return res.redirect(`/Mg_product/${_id}`);
    }
}
module.exports = { 
    buy_function,
    get_buy, 
    functionGetOderProduct,
    your_Product, 
    confirmProduct,
    findProduct,
    customer_Consulting,
    };
