const { buy_Product } = require('../model/mongodb_Oder');
const { get_Product} = require('../model/mongodb_Product');

const get_buy = async(req, res, next) => {
    const { _id } = req.params;
    const user_Id = req.session.userData._id;

    try{
    if(!user_Id){
        console.log("Lôĩ ở phần xác nhận người mua ");
    }
    const product = await get_Product(_id);
    if (!product) {
        return res.status(404).send("Sản phẩm ko tồn tại");
    }
    res.render('buyProduct', {
        _id: product._id,
        name: product.name,
        quanlity: product.quanlity,
        type: product.type,
    });
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
        const { size, aquality, product_name } = req.body;

        if (!id_user || !name_user) {
            console.log('Lỗi hệ thống: Không xác nhận được người dùng mua');
            return res.status(401).redirect('/Error');
        }

        const newOrder = await buy_Product(_id, id_user, name_user, product_name, size, aquality);
        
        if (!newOrder) {
            console.log('Lỗi hệ thống: Không thể mua hàng');
            return res.status(404).send("Lỗi hệ thống mua hàng");
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