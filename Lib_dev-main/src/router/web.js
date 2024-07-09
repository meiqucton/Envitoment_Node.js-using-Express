const express = require('express');
const router = express.Router();

const { requireLogin } = require('../controllers/authentication');
const { OpenWeather } = require('../controllers/API_Controllers');
const { createAccount, get_OTP, logIn, forgot_Password, profileUser, getUser, Address, confirmfogotEmail, changePassword, getStore } = require('../controllers/Mongoo_User');
const Product= require('../controllers/Mongoo_Product');
const { buy_function, get_buy, confirmProduct ,functionGetOderProduct, your_Product} = require('../controllers/Mongoo_Oder');
const upload = require('../config/multerConfig');


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
router.post('/Fogot_Pass', forgot_Password);
router.get('/forgotPass/:token', confirmfogotEmail);
router.post('/UpdatePasss/:Email', changePassword);
// Profile Route
router.get('/addressUser',requireLogin, getUser )
router.get('/Profile', requireLogin, profileUser);
router.post('/updateAddress/:_id', requireLogin, Address);

// Weather Route

router.get('/pageWeather', requireLogin, (req, res) => res.render('weatherView'));
router.post('/Weather', requireLogin, OpenWeather);

// Product Routes
router.get('/addProduct',  requireLogin, (req, res) => res.render('addProduct'));
router.post('/addProduct',upload.single('image') ,requireLogin, Product.AddProducts);
router.get('/products/:type', requireLogin, Product.findTypes);
router.get('/theProduct/:_id', requireLogin, Product.in4_Products);

// Shop Routes
router.get('/Store/:userId', requireLogin, getStore)
router.post('/Responsice/:_id', requireLogin, Product.Responsice_Sales);
router.get('/SaleProduct/:_id', requireLogin, Product.getSale);
router.post('/SaleProduct/:_id', requireLogin, Product.Sale_Product);
router.get('/oderManagement', requireLogin, your_Product);
router.get('/oderManagement/:_id', requireLogin, functionGetOderProduct);
router.get('/wareHouses',Product.wareHouses );
router.get('/yourStore', requireLogin, (req, res) => res.render('yourStore'));
router.get('/Shop', requireLogin, Product.listProducts);
router.get('/Shop', requireLogin, (req, res) => res.render('ShopPage'));
//Customer Routes
router.get('/confirmPurchase/:token', requireLogin,confirmProduct);
router.post('/buyProduct/:_id',requireLogin, buy_function);
router.get('/Product/Buy/:_id',requireLogin, get_buy);
// Product function 
router.get('/updateProduct/:_id', requireLogin, Product.get_a_Product);
router.get('/Product/Rate/:_id', requireLogin, Product.getRate);
router.post('/Product/Rate/:_id', requireLogin, Product.rateTheProduct);        
router.post('/deleteProduct/:_id', requireLogin,Product.Del_products);
router.post('/updateProduct/:_id', requireLogin, Product.Update_products);

// Miscellaneous
router.get('/Test', (req, res) => res.render('test'));

module.exports = router;
