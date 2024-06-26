const { checkEmail, register, Login, forgotPassword, in4User, updateAdress } = require('../model/Mongodb_User');
const confirmEmail = require('../config/Send_Mail');
const otpGenerator = require('otp-generator');

let otp; // Global variable to store OTP

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
        if (age < 18) {
            req.flash('error', 'Bạn chưa đủ tuổi để đăng ký');
            return res.redirect('/');
        }

        const emailExists = await checkEmail(Email);
        if (emailExists) {
            req.flash('error', 'Email đã tồn tại');
            return res.redirect('/');
        }

        otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

        await confirmEmail.sendEmail(Email, 'Mã Xác Nhận',
            `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Xác nhận đăng ký tài khoản</title>
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
                <link href="/css/mailOTP.css" type="text/css" rel="stylesheet">
            </head>
            <body>
                <div class="container">
                    <h2>Xác nhận đăng ký tài khoản</h2>
                    <p>Cảm ơn bạn đã đăng ký tài khoản!</p>
                    <ul>
                        <li>
                            <strong>Username:</strong> ${UserName}
                        </li>
                        <li>
                            <strong>OTP:</strong> ${otp}
                        </li>
                    </ul>
                </div>
            </body>
            </html>`
        );

        req.session.userData = { UserName, Password, Email, BirthDay };
        return res.redirect('/checkOTP');
        
    } catch (err) {
        console.log(err);
        req.flash('error', 'Lỗi máy chủ nội bộ khi tạo người dùng');
        return res.status(500).redirect('/');
    }
};

const get_OTP = async (req, res) => {
    try {
        const { getOTP } = req.body;

        if (!getOTP) {
            req.flash('error', 'Vui lòng nhập mã xác nhận');
            return res.redirect('/checkOTP');
        }

        if (getOTP === otp) {
            const { UserName, Password, Email, BirthDay } = req.session.userData;
            delete req.session.userData;

            await register({ UserName, Password, Email, BirthDay });
            req.flash('success', 'Tạo tài khoản thành công');
            return res.redirect('/'); 
        } else {
            req.flash('error', 'Mã xác nhận không đúng');
            return res.redirect('/checkOTP');
        }
    } catch (err) {
        console.log(err);
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

        if (user) {
            const { UserName, Password } = user;
            req.flash('success', 'Thông tin tài khoản đã được gửi đến mail của bạn');
            await confirmEmail.sendEmail(Email, 'Quên Mật khẩu',
                `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Lấy lại mật khẩu</title>
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
                    <link href="/css/mailOTP.css" type="text/css" rel="stylesheet">
                </head>
                <body>
                    <div class="container">
                        <h2>Thông tin mật khẩu của bạn</h2>
                        <ul>
                            <li>
                                <strong>Username:</strong> ${UserName}
                            </li>
                            <li>
                                <strong>Password:</strong> ${Password}
                            </li>
                        </ul>
                    </div>
                </body>
                </html>`
            );
            return res.redirect('/');
        } else {
            req.flash('error', 'Email không tồn tại');
            return res.redirect('/forgotPass');
        }
    } catch (err) {
        console.log(err);
        req.flash('error', 'Lỗi máy chủ nội bộ khi khôi phục mật khẩu');
        return res.status(500).redirect('/');
    }
};
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

module.exports = {
    createAccount,
    get_OTP,    
    logIn,
    forgot_Password,
    profileUser,
    Address,
    getUser

};
