const MongoClient = require('../model/Mongodb_User');
const confirmEmail = require('../config/Send_Mail');
const otpGenerator = require('otp-generator');

let otp; // Khai báo biến otp là biến toàn cục
const CreateUser = async (req, res) => {
    const { UserName, Password, Email, BirthDay } = req.body;
    // Generate a 6-digit numeric OTP
    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    

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
        const emailExists = await MongoClient.checkEmail(Email);
        if (emailExists) {
            req.flash('error', 'Email đã tồn tại');
            return res.redirect('/');
        }
       // await MongoClient.createUser({UserName, Password, Email, BirthDay});
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
      res.redirect('/checkOTP');
    } catch (err) {
        console.log(err);
        req.flash('error', 'Lỗi máy chủ nội bộ khi tạo người dùng');
        return res.status(500).redirect('/');
    }
};
const get_OTP = async(req, res, next) =>{
    try {
        const { UserName, Password, Email, BirthDay } = req.body;
        const { getotp } = req.body;
        res.render('checkOTP', { getOTP: getotp });

        if (getotp === otp) {
            await MongoClient.createUser({ UserName, Password, Email, BirthDay });
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
}

module.exports = {
    CreateUser,
    get_OTP
    
};