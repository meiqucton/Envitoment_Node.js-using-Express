const { checkEmail, register, Login, forgotPassword, in4User, updateAdress, updatePassword, folow_Store, createrVoucher} = require('../model/Mongodb_User');
const theProduct = require('../model/Mongodb_Product');
const confirmEmail = require('../config/Send_Mail');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');

let otp;
const createAccount = async (req, res) => {
    const { UserName, Password, Email, BirthDay } = req.body;

    try {
        if (!UserName || !Password || !Email || !BirthDay) {
            req.flash('error', 'Vui lòng nhập đầy đủ thông tin');
            return res.redirect('/');
        }

       
        const passwordFormat = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
        if (!passwordFormat.test(Password)) {
            req.flash('error', 'Mật khẩu không đủ mạnh (ít nhất 8 ký tự, có ít nhất một chữ hoa và một ký tự đặc biệt)');
            return res.redirect('/');
        }

      
        const currentDate = new Date();
        const dateOfBirthDay = new Date(BirthDay);
        const age = currentDate.getFullYear() - dateOfBirthDay.getFullYear();
        if (currentDate < new Date(currentDate.getFullYear(), dateOfBirthDay.getMonth(), dateOfBirthDay.getDate())) {
            age--;
        }
        if (age < 18) {
            req.flash('error', 'Bạn chưa đủ tuổi để đăng ký');
            return res.redirect('/');
        }

       
        const emailExists = await checkEmail(Email);
        if (emailExists) {
            req.flash('error', 'Email đã tồn tại');
            return res.redirect('/');
        }

        
        const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
        req.session.otp = otp;

       
        await confirmEmail.sendEmail(Email, 'Mã Xác Nhận',
            `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Xác nhận đăng ký tài khoản</title>
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Roboto', sans-serif; }
                    .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
                    h2 { color: #333; }
                    ul { list-style-type: none; padding: 0; }
                    li { margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Xác nhận đăng ký tài khoản</h2>
                    <p>Cảm ơn bạn đã đăng ký tài khoản!</p>
                    <ul>
                        <li><strong>Username:</strong> ${UserName}</li>
                        <li><strong>OTP:</strong> ${otp}</li>
                    </ul>
                </div>
            </body> 
            </html>`
        );

        // Store user data in session
        req.session.userData = { UserName, Password, Email, BirthDay };
        return res.redirect('/checkOTP');
        
    } catch (err) {
        console.error(err);
        req.flash('error', 'Lỗi máy chủ nội bộ khi tạo người dùng');
        return res.status(500).redirect('/');
    }
};

const get_OTP = async (req, res) => {
    try {
        const { getOTP } = req.body;
        const { otp } = req.session;

        
        if (!getOTP) {
            req.flash('error', 'Vui lòng nhập mã xác nhận');
            return res.redirect('/checkOTP');
        }

     
        if (getOTP === otp) {
            const { UserName, Password, Email, BirthDay } = req.session.userData;
            delete req.session.userData;
            delete req.session.otp;

            
            await register({ UserName, Password, Email, BirthDay });
            req.flash('success', 'Tạo tài khoản thành công');
            return res.redirect('/'); 
        } else {
            req.flash('error', 'Mã xác nhận không đúng');
            return res.redirect('/checkOTP');
        }
    } catch (err) {
        console.error(err);
        req.flash('error', 'Lỗi máy chủ nội bộ khi xác nhận OTP');
        return res.status(500).redirect('/');
    }
};

const logIn = async (req, res) => {
    const { Email, Password } = req.body;

    try {
        if (!Email || !Password) {
            req.flash('error', 'Vui lòng nhập đầy đủ thông tin');
            return res.redirect('/');
        }

        const userData = await Login(Email, Password);

        if (userData) {
            req.session.userData = userData;
            res.render('Home');
        } else {
            req.flash('error', 'Tài khoản không tồn tại hoặc mật khẩu không đúng');
            return res.redirect('/');
        }
    } catch (err) {
        console.log(err);
        req.flash('error', 'Lỗi máy chủ nội bộ khi đăng nhập');
        return res.status(500).redirect('/');
    }
};

const forgot_Password = async (req, res) => {
    const { Email } = req.body;

    try {
        if (!Email) {
            req.flash('error', 'Vui lòng Nhập Email');
            return res.redirect('/forgotPass');
        }

        const user = await forgotPassword(Email);
        if(!user){
            req.flash('error', 'Email không tồn tại');
            return res.redirect('/FogotPass');
        }
        const token = jwt.sign({Email}, 'secret', {expiresIn: '1h'}); 
        const confirmationUrl = `${req.protocol}://${req.get('host')}/forgotPass/${token}`;
        await confirmEmail.sendEmail(Email, 'Quên mật khẩu',
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
                    <h2>Xác nhận Quên mật khẩu</h2>
                    <a href="${confirmationUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Xác nhận tài khoản</a>
                </div>
            </body>
        </html>`        
        );
        req.flash('success','Vui lòng vào email để xác nhận');
        return res.redirect('/');
    } catch (err) {
        console.log(err);
        req.flash('error', 'Lỗi máy chủ nội bộ khi khôi phục mật khẩu');
        return res.status(500).redirect('/');
    }
};
const confirmfogotEmail = async(req, res) => {
    try{
        const token = req.params.token;
        const getJWT = jwt.verify(token,'secret');
        const {Email} = getJWT;
        if(!getJWT){
            req.flash('error', 'Token không Hợp lệ');
            return res.redirect('/');
        }
        const user = await forgotPassword(Email);
        if(!user){
            req.flash('error', 'Email không tồn tại');
            return res.redirect('/');
        }
        res.render('changePassword', {
            UserName: user.UserName,
            Email: user.Email

        });
    }
    catch(err){
        console.log(err);
        req.flash('error', 'L��i máy chủ nội bộ khi xác nhận mật khẩu');
        return res.status(500).redirect('/');
    }
}
const getUser = async (req, res) => {
    
    try{
        const _id = req.session.userData._id;
        const Name = req.session.userData.UserName;

        const user = await in4User(_id);
        if(!user){
            console.log('Không tìm thấy máy chủ của người dùng ở phần Controller(getUser)');
            return res.status(404).redirect('/Error');
        }
        else{
            res.render('Address', {
                _id: _id,
                userName: Name,
                country: user.countryl,
                city: user.city,
                conscious: user.conscious,
                stressName: user.stressName,
                phoneNumber: user.phoneNumber
            });
        }
    }catch(err){
        console.log(err);
        req.flash('error', 'L��i máy chủ nội bộ khi lấy thông tin người dùng');
        return res.status(500).redirect('/Error');
    }
}
const changePassword = async (req, res) => {
    try{
        const {Email} = req.params;
        const {password} = req.body;
        const user = await forgotPassword(Email);
        if(!user){
            req.flash('error', 'Email không tồn tại');
            return res.redirect('/');
        }
        const Changed = await updatePassword(Email, password);
        if(!Changed){
            console.log('Không thể thay đ��i mật khẩu');
            req.flash('error', 'Mật khẩu không thay đ��i');
            return res.redirect('/forgotPass');
        }
        req.flash('success', 'Đổi mật khẩu thành công');
        return res.redirect('/');
    }
    catch(err){
        console.log(err)
        req.flash('error', 'L��i máy chủ nội bộ khi đ��i mật khẩu');
    }
}
const profileUser = async (req, res) => {
    try {

        
        const _id = req.session.userData._id;
        const user = await in4User(_id);
        
        if (!user) {
            req.flash('error', 'Lỗi xác nhận ngừoi dùng ');
            return res.status(404).redirect('/');
        } else {
            res.render('profile_User', {
                UserName: user.UserName,
                Email: user.Email,
                BirthDay: user.BirthDay,
                Password: user.Password
            });
        }
    } catch (err) {
        console.log(err);
        req.flash('error', 'Lỗi máy chủ nội bộ khi lấy thông tin người dùng');
        return res.status(500).redirect('/Error');
    }
};
const Address = async(req, res) => {
    const { country, city, conscious, stressName, phoneNumber} = req.body;
    const _id = req.session.userData._id;
    const Address = req.session.userData._id;
    try{
        if(!_id) {
            console.log('Không tìm thấy máy chủ của người dùng ở phần Controller(Address)');
            return res.status(500).redirect('/Error');   
        }
        if(Address ){

        }
        const productUpdated = await updateAdress(_id, country, city, conscious, stressName, phoneNumber,);
        if(!productUpdated){
            console.log('Cập nhật thông tin người dùng thất bại');
            req.flash('Update address is notsuccessfully');
        }
        else{
            console.log('Cập nhật thông tin người dùng thành công');
            req.flash('Update address successfully');
            res.redirect('/profile');
        }

    }catch(err){
        console.log(err);
        req.flash('error', 'L��i máy chủ nội bộ khi cập nhật thông tin người dùng');
        return res.status(500).redirect('/Error');
    }       
};
const getStore = async(req, res) => {
    const { userId } = req.params;
    const user_Id = req.session.userData._id; 
    try{
        if(!user_Id){
            req.flash('error','Vui lòng đăng nhập trước khi xem sản phẩm');
            console.log('Không tìm thấy máy chủ của người dùng ở phần Controller(getStore)');
            return res.status(404).redirect('/');   
        }
        const getStore = await theProduct.wareHouse(userId);
        if(!getStore){
            req.flash('error', 'Không tìm thấy cửa hàng này');
            console.log('Không tìm thấy cửa hàng này');
            return res.redirect(`/theProduct/${_id}`);
        }
        res.render('storePage', {
            getTheStore: getStore,
        });
    }catch(err){
        console.log('Lỗi getStore: ' + err);
    }   
}
const folowStore = async (req, res) => {
    try {
        const _id = req.params.id;
        const user_Id = req.session.userData._id;
        const storeId = req.params.userId;

        if (!user_Id) {
            req.flash('error', 'Vui lòng đăng nhập trước khi theo dõi cửa hàng');
            console.log('Không tìm thấy máy chủ của người dùng ở phần Controller(folow_Store)');
            return res.status(404).redirect('/');
        }
        const folow = await folow_Store(user_Id, storeId);

        const checkFollow = await in4User(user_Id);
        const checkFollowLast = checkFollow.follow_store.map(store => store.id_store);

        if (checkFollowLast.includes(storeId)) {
            req.flash('error', 'Bạn đã theo dõi cửa hàng này rồi');
            console.log('Bạn đã theo dõi cửa hàng này rồi');
            return res.redirect(`/shop`);
        }

        if (folow) {
            console.log('Người dùng với ID:', user_Id, 'theo dõi cửa hàng với ID:', storeId);
            req.flash('success', 'Theo dõi cửa hàng thành công');
            return res.redirect('/Shop');
        } else {
            throw new Error('Không thể theo dõi cửa hàng');
        }
    } catch (err) {
        console.log('Lỗi folow_Store: ' + err);
        req.flash('error', 'Lỗi máy chủ nội bộ khi theo dõi cửa hàng');
        return res.status(500).redirect('/');
    }
};

const createrVouchers = async (req, res) => {
    try{
        const user_Id = req.session.userData._id;
        const {codeVoucher, typeForProduct ,Discount, Expirationdate, useQuantity} = req.body;
        if(!user_Id){
            req.flash('error', 'Vui lòng đăng nhập trước khi tạo mã giảm giá');
            console.log('Không tìm thấy máy chủ của người dùng ở phần Controller(createrVouchers)');
            return res.status(404).redirect('/');
        }
      
        const Voucher = {user_Id, codeVoucher, typeForProduct ,Discount, Expirationdate, useQuantity};
        const createVoucher = await createrVoucher(Voucher);
        if(!createVoucher){
            console.log('Tạo mã giảm giá thất bại');
            req.flash('error', 'Tạo mã giảm giá thất bại');
        }
        else{
            console.log('Tạo mã giảm giá thành công');
            req.flash('success', 'Tạo mã giảm giá thành công');
            return res.redirect('/yourStore');
        }
    }
    catch(error){
        console.log('L��i createrVouchers: '+ error);
        req.flash('error', 'Loii máy chủ nội bộ khi tạo mã giảm giá');
        return res.status(500).redirect('/');
    }
};


module.exports = {
    createAccount,
    get_OTP,    
    logIn,
    forgot_Password,
    profileUser,
    Address,
    getUser, 
    confirmfogotEmail,
    changePassword,
    getStore,
    folowStore,
    createrVouchers,
};
