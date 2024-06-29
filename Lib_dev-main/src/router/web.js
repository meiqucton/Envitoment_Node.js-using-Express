const express = require('express');
const router = express.Router();

const { requireLogin } = require('../controllers/authentication');
const { OpenWeather } = require('../controllers/API_Controllers');
const { createAccount, get_OTP, logIn, forgot_Password, profileUser, getUser, Address } = require('../controllers/Mongoo_User');
const { listProducts, AddProducts, findTypes, in4_Products, rateTheProduct, getRate, wareHouses, Del_products, get_a_Product, Update_products} = require('../controllers/Mongoo_Product');
const { buy_function, get_buy} = require('../controllers/Mongoo_Oder');

// Import biến upload từ Multer
const multer = require('multer');
const path = require('path');

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads'); // Thư mục lưu trữ file
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname)); // Đổi tên file
        }
    })
});

// Home and Error Pages
router.get('/', (req, res) => res.render('Oripage'));
router.get('/Home', requireLogin);
router.get('/Error', (req, res) => res.render('ErrorPage'));

// Authentication Routes
router.post('/Signin', logIn);
router.post('/Signup', createAccount);
router.get('/checkOTP', (req, res) => res.render('checkOTP'));
router.post('/checkOTP', get_OTP);
router.get('/FogotPass', (req, res) => res.render('FogotPass'));
router.post('/Fogot_Pass', requireLogin, forgot_Password);

// Profile Route
router.get('/addressUser',requireLogin, getUser )
router.get('/Profile', requireLogin, profileUser);
router.post('/updateAddress/:_id', requireLogin, Address);

// Weather Route
router.get('/pageWeather', requireLogin, (req, res) => res.render('weatherView'));
router.post('/Weather', requireLogin, OpenWeather);

// Product Routes
router.get('/addProduct', requireLogin, (req, res) => res.render('addProduct'));
router.post('/addProduct', requireLogin, AddProducts);
router.get('/products/:type', requireLogin, findTypes);
router.get('/theProduct/:_id', requireLogin, in4_Products);

// Shop Routes
router.get('/wareHouses',wareHouses );
router.get('/yourStore', requireLogin, (req, res) => res.render('yourStore'));
router.get('/Shop', requireLogin, listProducts);
router.get('/Shop', requireLogin, (req, res) => res.render('ShopPage'));
//Customer Routes
router.post('/buyProduct/:_id',requireLogin, buy_function);
router.get('/Product/Buy/:_id',requireLogin, get_buy);
// Product function 
router.get('/updateProduct/:_id', requireLogin, get_a_Product);
router.get('/Product/Rate/:_id', requireLogin, getRate);
router.post('/Product/Rate/:_id', requireLogin, rateTheProduct);
router.post('/deleteProduct/:_id', requireLogin,Del_products);
router.post('/updateProduct/:_id', requireLogin, Update_products);

// Miscellaneous
router.get('/Test', (req, res) => res.render('test'));

module.exports = router;
