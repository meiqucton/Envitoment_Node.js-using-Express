const { buy_Product } = require('../model/mongodb_Oder');
const { get_Product, Update_product} = require('../model/mongodb_Product');
const get_buy = async(req, res, next) => {
    const { _id } = req.params;
    const user_Id = req.session.userData._id;
    const address = req.session.userData.address; 

    try{
    if(!user_Id){
        console.log("Lôĩ ở phần xác nhận người mua ");
    }
    if(!address){
        req.flash('error', 'Vui lòng cập nhật địa chỉ');
        return res.redirect(`/theProduct/${_id}`);
    }

    const product = await get_Product(_id);
    if (!product) {
        return res.status(404).send("Sản phẩm ko tồn tại");
    }
    else{
        if(isNaN(product.quanlity)){
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
    }catch(err){
        console.log("Lỗi get_buy(Controller): ", err);
        return res.status(401).redirect('/Error');
    }
    }
    const buy_function = async (req, res) => {
        try {
            const _id = req.params._id;
            const id_user = req.session.userData._id;
            const name_user = req.session.userData.UserName;
            const addresses = req.session.userData.address;

            const { size, theQuanlity, product_name, address_index } = req.body;
    
            if (!id_user || !name_user) {
                console.log('Lỗi hệ thống: Không xác nhận được người dùng mua');
                return res.status(401).redirect('/Error');
            }
    
            // Get the current product
            const product = await get_Product(_id);
            if (!product) {
                return res.status(404).send("Sản phẩm không tồn tại");
            }
    
            const updatedQuantity = product.quanlity - theQuanlity;
    
            const updatedProduct = await Update_product(_id, { quanlity: updatedQuantity });
            if (!updatedProduct) {
                console.log('Lỗi hệ thống: Không thể cập nhật số lượng sản phẩm');
                return res.status(500).redirect('/Error');
            }
    
            // Get selected address details
            const selectedAddress = addresses[address_index];
            if (!selectedAddress) {
                console.log('Lỗi hệ thống: Không thể tìm thấy địa chỉ đã chọn');
                return res.status(400).send("Lỗi hệ thống địa chỉ");
            }
    
            const newOrder = await buy_Product(_id, id_user, name_user, product_name, size, theQuanlity, selectedAddress);
            if (!newOrder) {
                console.log('Lỗi hệ thống: Không thể mua hàng');
                return res.status(500).send("Lỗi hệ thống mua hàng");
            }
    
            req.flash('success', 'Mua hàng thành công');
            console.log("Mua hàng thành công:", newOrder);
            return res.redirect(`/theProduct/${_id}`);
            
        } catch (err) {
            console.log("Lỗi trong buy_function (Controller):", err);
            res.status(500).redirect('/Error');
        }
    };
    

module.exports = { buy_function, get_buy};