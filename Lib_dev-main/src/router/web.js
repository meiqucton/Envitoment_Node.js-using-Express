const express = require('express');
const router = express.Router();

const homeController = require('../controllers/authentication');
const { OpenWeather } = require('../controllers/API_Controllers');
const { createAccount, get_OTP, logIn, forgot_Password } = require('../controllers/Mongoo_User');
const { listProducts, AddProducts } = require('../controllers/Mongoo_Product');

// Import biến upload từ Multer

router.get('/', (req, res) => res.render('Oripage'));
router.get('/Home', homeController.showHome);

router.post('/Signin', logIn);
router.post('/Signup', createAccount);

router.get('/checkOTP', (req, res) => res.render('checkOTP'));
router.post('/checkOTP', get_OTP);

router.get('/FogotPass', (req, res) => res.render('FogotPass'));
router.post('/Fogot_Pass', forgot_Password);

router.get('/pageWeather', (req, res) => res.render('weatherView'));
router.post('/Weather', OpenWeather);

router.get('/addProduct', (req, res) => res.render('addProduct'));
router.post('/addProduct', AddProducts);

router.get('/Shop', listProducts);
router.get('/Shop', (req, res) => res.render('ShopPage'));

router.get('/Test', (req, res) => res.render('test'));

module.exports = router;
