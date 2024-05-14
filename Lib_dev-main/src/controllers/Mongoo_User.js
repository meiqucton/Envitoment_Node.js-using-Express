const { checkEmail, register , Login, forgotPassword } = require('../model/Mongodb_User');
const confirmEmail = require('../config/Send_Mail');
const otpGenerator = require('otp-generator');


let otp; // Khai báo biến otp là biến toàn cục
const createAccount = async (req, res) => {
    
    const { UserName, Password, Email, BirthDay } = req.body;
    // Generate a 6-digit numeric OTP
    otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    try {
        // Check if all required fields are provided
        if (!UserName || !Password || !Email || !BirthDay) {
            req.flash('error', 'Vui lòng nhập đầy đủ thông tin');
            return res.redirect('/');
        }

        // Validate password format
        const passwordFormat = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
        if (!passwordFormat.test(Password)) {
            req.flash('error', 'Mật khẩu không đủ mạnh (ít nhất 8 ký tự, có ít nhất một chữ hoa và một ký tự đặc biệt)');
            return res.redirect('/');
        }

        // Calculate age based on BirthDay
        const currentDate = new Date();
        const dateOfBirthDay = new Date(BirthDay);
        const age = currentDate.getFullYear() - dateOfBirthDay.getFullYear();
        if (age < 18) {
            req.flash('error', 'Bạn chưa đủ tuổi để đăng ký');
            return res.redirect('/');
        }

        // Check if email already exists
        
        const emailExists = await checkEmail(Email);
        if (emailExists) {
            req.flash('error', 'Email đã tồn tại');
            return res.redirect('/');
        }
       // await MongoClient.createAccount({UserName, Password, Email, BirthDay});
      await confirmEmail.sendEmail( Email, 'Mã Xác Nhận',
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
      </html>
      `)    
      req.session.userData = { UserName, Password, Email, BirthDay }; // Lưu dữ liệu vào session / để dùng cho các biến khác 
      res.redirect('/checkOTP');
      
    } catch (err) {
        console.log(err);
        req.flash('error', 'Lỗi máy chủ nội bộ khi tạo người dùng');
        return res.status(500).redirect('/');
    }
};
const get_OTP = async (req, res) => {
    try {
        const { getOTP } = req.body; // Lấy mã OTP từ form

        if (!getOTP) {
            req.flash('error', 'Vui lòng nhập mã xác nhận');
            return res.redirect('/checkOTP');
        }

        // Kiểm tra xem mã OTP nhập vào có khớp với mã đã gửi không
        if (getOTP === otp) {
            // Nếu khớp, tạo người dùng
        const { UserName, Password, Email, BirthDay } = req.session.userData;
            delete req.session.userData; // Xóa dữ liệu khỏi session sau khi sử dụng

            await register({ UserName, Password, Email, BirthDay });
            console.log(`Người dùng ${UserName} đã được thêm vào hệ thống`);
            req.flash('success', 'Tạo tài khoản thành công');
            return res.redirect('/'); // Chuyển hướng sau khi tạo tài khoản thành công
        } else {
            req.flash('error', 'Mã xác nhận không đúng');
            return res.redirect('/checkOTP'); // Chuyển hướng nếu mã xác nhận không đúng
        }
    } catch (e) {
        console.log(e);
        req.flash('error', 'Lỗi máy chủ nội bộ khi tạo người dùng');
        return res.status(500).redirect('/');
    }
};
const logIn = async (req, res) => {
    const { Email, Password } = req.body;
  
    if (!Email || !Password) {
      req.flash('error', 'Vui lòng nhập đầy đủ thông tin');
      return res.redirect('/');
    }
  
    try {
      const checkLogin = await Login(Email, Password);
  
      if (checkLogin) {
        req.flash('success', 'Đăng nhập thành công');
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
    if(!Email){
        req.flash('error', 'Vui lòng Nhập Email');
        return res.redirect('/forgotPass');
    }
    try{
        const Forgot = await forgotPassword(Email);
        if(Forgot){
            const { UserName, Password} = Forgot;
            req.flash('success', 'thông tin tài khoản đã được gửi đến mail của bạn ');
            await confirmEmail.sendEmail( Email, 'Quên Mật khẩu',
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
                <h2>Đây là Password Shop Dev của bạn</h2>
                <ul>
                    <li>
                        <strong>Username:</strong> ${UserName}
                    </li>
                    <li>
                        <strong>Pass:</strong> ${Password}
                    </li>
                </ul>
            </div>
            </body>
            </html>
            `)    
            res.redirect('/')
        }else{
            req.flash('error', 'Email không tồn tại');
            return res.redirect('/forgotPass');
        }
    }
    catch(err){
        console.log(err);
        req.flash('error', 'Lỗi máy chủ nội phía Forgot pass');
        return res.status(500).redirect('/');
    }
}
module.exports = {
    createAccount,
    get_OTP,
    logIn,
    forgot_Password,
};