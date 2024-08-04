const User= require('../model/Mongodb_User');
const theProduct = require('../model/mongodb_Product');
const confirmEmail = require('../config/Send_Mail');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const { errorMonitor } = require('nodemailer/lib/xoauth2');

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

       
        const emailExists = await User.checkEmail(Email);
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

            
            await User.register({ UserName, Password, Email, BirthDay });
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

        const userData = await User.Login(Email, Password);

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

        const user = await User.forgotPassword(Email);
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
        const user = await User.forgotPassword(Email);
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

        const user = await User.in4User(_id);
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
        const user = await User.forgotPassword(Email);
        if(!user){
            req.flash('error', 'Email không tồn tại');
            return res.redirect('/');
        }
        const Changed = await User.updatePassword(Email, password);
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
        const user = await User.in4User(_id);
        
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
        const productUpdated = await User.updateAdress(_id, country, city, conscious, stressName, phoneNumber,);
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
};const getStore = async (req, res) => {
    const { userId } = req.params;
    try {
        console.log('userId', userId);
        const getStore = await theProduct.wareHouse(userId);
        const getVoucher = await User.getVouCherCilent(userId);

        if (!getStore) {
            req.flash('error', 'Cửa hàng này ko còn tồn tại nữa');
            return res.status(404).redirect('/shop');
        }

        res.render('storePage', {
            getTheStore: getStore,
            userId: userId,
            voucher: getVoucher,
        });
    } catch (err) {
        console.log('Lỗi getStore: ' + err);
        req.flash('error', 'Đã xảy ra lỗi khi lấy thông tin cửa hàng');
        res.redirect('/');
    }
};




const folowStore = async (req, res) => {
    try {
        const _id = req.params.id;
        const user_Id = req.session.userData._id;
        const storeId = req.params.userId;

        if (!user_Id) {
            req.flash('error', 'Vui lòng đăng nhập trước khi theo dõi cửa hàng');
            console.log('Không tìm thấy máy chủ của người dùng ở phần Controller(User.folow_Store)');
            return res.status(404).redirect('/');
        }
        const folow = await User.folow_Store(user_Id, storeId);

        const checkFollow = await User.in4User(user_Id);
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
        console.log('Lỗi User.folow_Store: ' + err);
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
            console.log('Không tìm thấy máy chủ của người dùng ở phần Controller(User.createrVouchers)');
            return res.status(404).redirect('/');
        }
      
        const Voucher = {user_Id, codeVoucher, typeForProduct ,Discount, Expirationdate, useQuantity};
        const createVoucher = await User.createrVoucher(Voucher);
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
        console.log('L��i User.createrVouchers: '+ error);
        req.flash('error', 'Loii máy chủ nội bộ khi tạo mã giảm giá');
        return res.status(500).redirect('/');
    }
};
const getTicketVoucher = async (req, res) => {
    try {
        const user_Id = req.session.userData._id;
        const { _id } = req.params;

        if (!user_Id) {
            req.flash('error', 'Vui lòng đăng nhập để lấy mã giảm giá');
            return res.status(401).redirect('/'); // 401 for unauthorized access
        }

        const getIn4Voucher = await User.getTicket_Voucher(_id);
        if (!getIn4Voucher) {
            req.flash('error', 'Voucher không tồn tại');
            return res.redirect('/shop');
        }

        const user = await User.in4User(user_Id);
        if (!user.Voucher || !user.Voucher.some(ticket => ticket.Voucher_id === _id)) {
            const voucherAdded = await User.addTicketVoucher(user_Id, _id, getIn4Voucher.Discount, getIn4Voucher.typeForProduct, getIn4Voucher.Expirationdate); // Assuming User.addTicketVoucher is the correct method
            if (voucherAdded) {
                req.flash('success', 'Lấy mã giảm giá thành công');
            } else {
                req.flash('error', 'Failed to add voucher');
            }
        } else {
            req.flash('error', 'Bạn đã lấy Voucher này rồi');
        }
        res.redirect('/shop');
    } catch (error) {
        console.error('Error:', error);
        req.flash('error', 'An error occurred while processing your request');
        res.redirect('/shop');
    }
};
const ListUsers = async(req, res) => {
    try{
        const listUser = await User.listUsers();
       
        res.render('listUser', {
            listUser,

        });
    }catch(err){
        console.log('Error:', err);
    }
}
const getUserInChat = async (req, res) => {
    try {
        const user_Id = req.session.userData._id;
        const UserName = req.session.userData.UserName;


        if (!user_Id) {
            req.flash('error', 'Vui lòng đăng nhập');
            return res.status(401).redirect('/');
        }
        res.render('forum', {
            user_Id,  // Truyền user_Id vào view
            UserName
        });
    } catch (err) {
        console.log('Error:', err);
        req.flash('error', 'Có lỗi xảy ra');
        return res.status(500).redirect('/');
    }
}

const roomChat = async (req, res) => {
    try {
        const user_Id = req.session.userData._id;
        const UserName = req.session.userData.UserName;
        const { message } = req.body;

        if (!user_Id) {
            req.flash('error', 'Vui lòng đăng nhập để vào phòng chat');
            return res.status(401).redirect('/'); // 401 for unauthorized access
        }

        const socket = req.app.get('socketio'); // Get the Socket.IO instance from the server
        const roomChat = { user_Id, UserName, message };

        // Phát tin nhắn đến một phòng chat cụ thể
        socket.emit('chat forum', roomChat); // Emit 'chat forum' để gửi tin nhắn đến phòng chat chung


        // Gửi sự kiện join
        socket.emit('join', UserName);
        socket.emit('leaverChat', UserName);
        console.log('Gửi tin nhắn thành công');
        res.status(200).send('Tin nhắn đã được gửi');
    } catch (err) {
        console.log('Error:', err);
        req.flash('error', 'Lỗi khi gửi tin nhắn');
        return res.status(500).redirect('/');
    }
};
const chatBox = async (req, res) => {
    try {
        const { _id } = req.params;
        const user_Id = req.session.userData._id;
        const UserName = req.session.userData.UserName; 

        if (!user_Id) {
            console.log('User vui lòng đăng nhập');
            req.flash('error', 'Vui lòng đăng nhập trước khi gửi tin nhắn');
            return res.status(401).redirect('/');
        }
        const chatHistory = await User.chatBox(user_Id, _id);
        if(!chatHistory){

        }
        res.render('chatBox', { user_Id, otherUserId: _id, UserName}); // Render the chat view with user IDs
    } catch (err) {
        console.log('Error:', err);
        req.flash('error', 'Lỗi khi gửi tin nhắn');
        return res.status(500).redirect('/');
    }
};
const getFeedBack = async(req, res) => {
    try{
        const {_id} = req.params;
        const user_Id = req.session.userData._id;
        const UserName = req.session.userData.UserName; // Tên người gửi
        if(!user_Id){
            req.flash('error', 'Vui lòng đăng nhập');
            return res.status(401).redirect('/');
        }
        const in4_Products = await theProduct.in4Product(_id);
        res.render('feedBack', {
            in4_Products,
            _id,
            user_Id,
            UserName,
        })
        socket.emit('join', UserName);

    }catch(err){
        console.log('Error:', err);
        req.flash('error', 'L��i khi lấy đánh giá');
    }
}
const sendMessage = async (req, res) => {
    try {
        const { _id } = req.params; // ID của người nhận
        const user_Id = req.session.userData._id; // ID của người gửi
        const { message } = req.body; // Nội dung tin nhắn
        const UserName = req.session.userData.UserName; // Tên người gửi

        // Kiểm tra xem người dùng đã đăng nhập hay chưa
        if (!user_Id) {
            return res.status(401).json({ error: 'Vui lòng đăng nhập' });
        }

        // Tạo ID phòng chat từ ID của người gửi và người nhận
        const roomId = [user_Id, _id].sort().join('-'); 


        // Lấy đối tượng socket từ ứng dụng
        const socket = req.app.get('socketio'); 
        const chatMessage = { user_Id, message, roomId, UserName };

        // Gửi tin nhắn đến phòng chat
        socket.to(roomId).emit('sendMessage', chatMessage); 
        res.status(200).json({ message: 'Tin nhắn đã được gửi' });

    } catch (err) {
        console.log('Error:', err);
        return res.status(500).json({ error: 'Lỗi khi gửi tin nhắn' });
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
    getTicketVoucher,
    ListUsers,
    getUserInChat,
    roomChat,
    sendMessage,
    chatBox,
    getFeedBack,
};
