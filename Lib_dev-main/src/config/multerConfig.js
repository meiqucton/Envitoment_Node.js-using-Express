const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ cho Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/'); // Thư mục lưu trữ ảnh
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên file
    }
});

// Kiểm tra định dạng file upload
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    if (!filetypes){
        req.flash('err', "chỉ nhận file Ảnh /jpeg|jpg|png/");
        return res.redirect('/addProduct');

    } 
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận các định dạng ảnh: JPEG, JPG, PNG'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Giới hạn kích thước file: 5MB
});

module.exports = upload;
