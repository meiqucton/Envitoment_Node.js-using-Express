const { buy_Product, getOderProduct, yourProduct } = require('../model/mongodb_Oder');
const theProduct = require('../model/Mongodb_Product');
const Mg_user  = require('../model/Mongodb_User');
const confirmEmail = require('../config/Send_Mail');

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const get_buy = async (req, res, next) => {
    const { _id } = req.params;

    if (req.session && req.session.userData) {
        const user_Id = req.session.userData._id;
        const address = req.session.userData.address;

        try {
            if (!user_Id) {
                console.log("Lỗi ở phần xác nhận người mua");
                return res.status(401).redirect('/Error');
            }

            if (!address) {
                req.flash('error', 'Vui lòng cập nhật địa chỉ');
                return res.redirect(`/theProduct/${_id}`);
            }

            const product = await theProduct.get_Product(_id);
            if (!product) {
                return res.status(404).send("Sản phẩm không tồn tại");
            } else {
                if (isNaN(product.quanlity)) {
                    req.flash('error', 'Sản phẩm đã hết hàng');
                    return res.redirect(`/theProduct/${_id}`);
                }
                res.render('buyProduct', {
                    _id: product._id,
                    name: product.name,
                    quanlity: product.quanlity,
                    type: product.type,
                    Address: address,
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
    // Kiểm tra session và userData của người dùng
    if (req.session && req.session.userData) {
        try {
            // Lấy _id sản phẩm từ params và thông tin người dùng từ session
            const _id = req.params._id;
            const id_user = req.session.userData._id;
            const name_user = req.session.userData.UserName;
            const addresses = req.session.userData.address;

            // Lấy các thông tin sản phẩm và địa chỉ từ body request
            const { size, theQuanlity, product_name, address_index } = req.body;
            const selectedAddress = addresses[address_index];
            // Kiểm tra xem có đủ thông tin người dùng không
            if (!id_user || !name_user) {
                console.log('Lỗi hệ thống: Không xác nhận được người dùng mua');
                return res.status(401).redirect('/Error');
            }

            // Lấy thông tin sản phẩm từ hàm theProduct.get_Product
            const product = await theProduct.get_Product(_id);
            if (!product) {
                return res.status(404).send("Sản phẩm không tồn tại");
            }

            // Cập nhật số lượng sản phẩm sau khi mua
            const updatedQuantity = product.quanlity - theQuanlity;
            const updatedProduct = await theProduct.Update_product(_id, { quanlity: updatedQuantity });
            if (!updatedProduct) {
                console.log('Lỗi hệ thống: Không thể cập nhật số lượng sản phẩm');
                return res.status(500).redirect('/Error');
            }

            // Lấy địa chỉ mua hàng đã chọn từ danh sách địa chỉ của người dùng
           

            // Lấy email của người dùng từ hàm Mg_user.in4User
            const emailForBuyProduct = await Mg_user.in4User(id_user);
            if (!emailForBuyProduct) {
                console.log('Lỗi hệ thống: Không tìm thấy email của người dùng');
                return res.status(500).send("Lỗi hệ thống email");
            }

            // Tạo JWT token chứa các thông tin cần thiết
            const token = jwt.sign({ _id, id_user, name_user, product_name, size, theQuanlity, selectedAddress }, 'secret', { expiresIn: '1h' });

            // Tạo URL xác nhận mua hàng
            const confirmationUrl = `${req.protocol}://${req.get('host')}/confirmPurchase/${token}`;
            
            // Gửi email xác nhận mua hàng
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

            // Redirect đến trang thông báo kiểm tra email
            req.flash('success', 'Vui lòng check Email để xác nhận mua hàng');
            return res.redirect(`/theProduct/${_id}`);

        } catch (err) {
            // Bắt lỗi và in ra thông báo lỗi
            console.log("Lỗi trong buy_function (Controller):", err);
            res.status(500).redirect('/Error');
        }
    } else {
        // Nếu session hoặc userData không tồn tại, trả về lỗi Unauthorized
        console.log("Session hoặc userData không tồn tại");
        res.status(401).send("Unauthorized");
    }
};
const confirmProduct = async(req, res) => {
    try{
        const token = req.params.token;
        const getJWT = jwt.verify(token, 'secret');
        const {_id, id_user, name_user, product_name, size, theQuanlity, selectedAddress} = getJWT;
        if (!selectedAddress) {
            console.log('Lỗi hệ thống: Không thể tìm thấy địa chỉ đã chọn');
            return res.status(400).send("Lỗi hệ thống địa chỉ");
        }
        const product = await buy_Product(_id, id_user, name_user, product_name, size, theQuanlity, selectedAddress);

        if(!product){
            req.flash('error','Mua Hàng thất bại');
            return res.redirect(`/theProduct/${_id}`);
        }
        else{
            
            req.flash('success', "mua hàng thành công");
            return res.redirect(`/theProduct/${_id}`);
        }
    }catch(err){
            console.log("L��i trong confirmProduct (Controller):", err);
            req.flash('error', "Xác nhận mua hàng thất bại");
            return res.redirect(`/theProduct/${_id}`);
    
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

            const theproductOder = await getOderProduct(_id);
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
            const theYourProducts = await yourProduct(id_user);
            res.render('yourProduct', { 
                theYourProducts,
            });
        }
    } catch (err) {
        console.log("Error in yourProduct (Controller): ", err);
        res.status(500).send("Internal Server Error");
    }
}


module.exports = { buy_function,
     get_buy, 
     functionGetOderProduct,
      your_Product, 
      confirmProduct };
