const express = require('express');
const router = express.Router();
const homeController = require('../controllers/authentication');
const {APIOpenWeather, GoogleNews , Librarys} = require('../controllers/API_Controllers');    
const { AddBook,get_delete,Del_book,Find_Book_Title,Update_Book, get_update, List_books} = require('../controllers/Mongoo_Product');
const {createAccount, get_OTP, logIn} = require('../controllers/Mongoo_User');
const { Library } = require('../config/APIs');


// Define routes
router.get('/', (req, res) => res.render('Oripage'));
router.get('/Home', homeController.showHome);

router.post('/Signin', logIn)
router.post('/Signup',createAccount)
router.get('/checkOTP', (req, res) => res.render('checkOTP'));


router.get('/Addbook', (req, res) => res.render('MgAdd'));
router.post('/Addbooks',AddBook);

router.get('/FindBook',Find_Book_Title)

router.get('/UpdateBook/:_id',get_update);
router.post('/book/:_id',Update_Book)

router.get('/DeleteBook/:_id',get_delete);
router.post('/DeleteBook/:_id',Del_book)

//router.get('/checkOTP',(req,res) => res.render('checkOTP'));
router.post('/checkOTP',get_OTP )
router.get('/Library', List_books);


router.get('/libraryapi', Librarys)


module.exports = router;
