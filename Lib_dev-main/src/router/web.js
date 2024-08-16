const express = require('express');
const router = express.Router();

const { requireLogin } = require('../controllers/authentication');
const { OpenWeather } = require('../controllers/API_Controllers');
const User = require('../controllers/Mongoo_User');
const Product= require('../controllers/Mongoo_Product');
const Oder = require('../controllers/Mongoo_Oder');
const upload = require('../config/multerConfig');


// Home and Error Pages
router.get('/', (req, res) => res.render('Oripage'));
router.get('/Home', requireLogin);
router.get('/Error', (req, res) => res.render('ErrorPage'));

router.post('/getVoucher/:_id', requireLogin,User.getTicketVoucher);
router.get('/Store/:userId', requireLogin, User.getStore);
router.post('/Signin', User.logIn);
router.post('/Signup', User.createAccount);
router.get('/checkOTP', (req, res) => res.render('checkOTP'));
router.post('/checkOTP', User.get_OTP);
router.get('/FogotPass', (req, res) => res.render('FogotPass'));
router.post('/Fogot_Pass', User.forgot_Password);
router.get('/forgotPass/:token', User.confirmfogotEmail);
router.post('/UpdatePasss/:Email', User.changePassword);
// Profile Route
router.get('/listUser', User.ListUsers);
router.get('/CreteVoucher', requireLogin, (req, res) => res.render('VocherPage'))
router.post('/CreateVoucher', requireLogin, User.createrVouchers);
router.get('/addressUser',requireLogin, User.getUser )
router.get('/Profile', requireLogin, User.profileUser);
router.post('/updateAddress/:_id', requireLogin, User.Address)

// Weather Route
router.get('/Consulting/:user_Id', Oder.customer_Consulting); 
router.get('/chat/:_id', User.chatBox);
router.post('/sendMessage/:otherUserId', User.sendMessage);
router.get('/Chat', User.getUserInChat);
router.get('/pageWeather', requireLogin, (req, res) => res.render('weatherView'));
router.post('/Weather', requireLogin, OpenWeather);

// Product Routes
router.get('/addProduct',  requireLogin, (req, res) => res.render('addProduct'));
router.post('/addProduct',upload.single('image') ,requireLogin, Product.AddProducts);
router.get('/theProduct/:_id', requireLogin, Product.in4_Products, );

// Shop Routes

router.get('/findProduct', Oder.findProduct);
router.get('/search',Product.findProduct);
router.get('/BestSalesStore/:userId', Product.Product_bestSell_byShop);
router.get('/BestSale', Product.bestSlell);
router.get('/FlashDeal', Product.flash_deals);
router.post('/followStore/:userId', requireLogin, User.folowStore);
//router.get('/findType', Product.Find_type_PRODUCT);
//router.get('/products', controller_suggested_price);
router.post('/Responsice/:_id', requireLogin, Product.Responsice_Sales);
router.get('/SaleProduct/:_id', requireLogin, Product.getSale);
router.post('/SaleProduct/:_id', requireLogin, Product.Sale_Product);
router.get('/oderManagement', requireLogin, Oder.your_Product);
router.get('/oderManagement/:_id', requireLogin, Oder.functionGetOderProduct);
router.get('/wareHouses',Product.wareHouses );
router.get('/yourStore', requireLogin, (req, res) => res.render('yourStore'));
router.get('/Shop', requireLogin, Product.listProducts, );
//Customer Routes
router.get('/confirmPurchase/:token', requireLogin, Oder.confirmProduct);
router.post('/buyProduct/:_id',requireLogin,Oder.buy_function);
router.get('/Product/Buy/:_id',requireLogin, Oder.get_buy, );
// Product function 
router.get('/updateProduct/:_id', requireLogin, Product.get_a_Product);
router.get('/Product/Rate/:_id', requireLogin, Product.getRate);
router.post('/Product/Rate/:_id', requireLogin, Product.rateTheProduct);        
router.post('/deleteProduct/:_id', requireLogin,Product.Del_products);
router.post('/updateProduct/:_id', requireLogin, Product.Update_products);

router.get('/feedback/:_id',requireLogin, User.getFeedBack);

// Route để gửi phản hồi sản phẩm (dành cho lần đầu tiên)
// router.post('/feedback/:_id', requireLogin, feedBack);

// // Route để gửi tin nhắn
// router.post('/message/:_id',requireLogin, sendMessage);
// Miscellaneous
router.get('/Test', (req, res) => res.render('test'));

module.exports = router;
