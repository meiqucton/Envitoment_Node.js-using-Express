const express = require('express');
const router = express.Router();
const homeController = require('../controllers/authentication');
const { SiginCtr, SigupCtr, Update_custom, GetCustomById, Del_Cusotm, GetCustomById_Del, Find_cus} = require('../controllers/SQL_User');
//const { Addbooks, GetBook, Update_Books,GetBook_del,DeleteBook, Search_Book, GetBook_comment} = require('../controllers/Books');
const {APIOpenWeather, GoogleNews , Librarys} = require('../controllers/API_Controllers');    
const { AddBook,get_delete,Del_book,Find_Book_Title,Update_Book, get_update, List_books} = require('../controllers/Mongoo_Product');
const {CreateUser, get_OTP} = require('../controllers/Mongoo_User');
const Cus_Show = require('../controllers/SQL_UserList');
const Books_Show = require('../controllers/SQL_ProductList');
const { Library } = require('../config/APIs');


// Define routes
router.get('/', (req, res) => res.render('Oripage'));
router.get('/Home', homeController.showHome);




router.get('/Cus_Show', homeController.showHome,Cus_Show.getAllCustomers);

router.get('/searchId', Find_cus);

router.get('/Update/:CustomId', GetCustomById);
router.get('/Delete/:CustomId', GetCustomById_Del);




router.post('/Delete/:CustomId', Del_Cusotm);
router.post('/Update', Update_custom); 


router.post('/Signin', SiginCtr);
router.post('/Signup', CreateUser);
//router.post('/Signup', SigupCtr);             => SQL 

router.get('/Addbook', (req, res) => res.render('MgAdd'));
router.post('/Addbooks',AddBook);

router.get('/FindBook',Find_Book_Title)

router.get('/UpdateBook/:_id',get_update);
router.post('/book/:_id',Update_Book)

router.get('/DeleteBook/:_id',get_delete);
router.post('/DeleteBook/:_id',Del_book)

router.get('/checkOTP',(req,res) => res.render('checkOTP'));
router.post('/checkOTP',get_OTP )
router.get('/Library', List_books);

//router.get('/Home/Addbooks', (req, res) => res.render('AddBooks'));

//router.get('/Weather', APIOpenWeather);              SUCESSFUL =)) 
//router.get('/NewPaper', GoogleNews);
// router.get('/Book_show', Books_Show.getAllBooks);
//router.get('/Profile/:CustomId', Your_profile);

// router.get('/search', Search_Book);

// router.get('/UpdateBook/:Book_id', GetBook);
// router.get('/Comment/:Book_id',GetBook_comment)
// router.get('/DeleteBooks/:Book_id', GetBook_del);
// router.post('/Comment', Comments);

// router.post('/DeleteBooks/:Book_id', DeleteBook);
// router.post('/Updatebook', Update_Books)
// router.post('/Addbooks', Addbooks);

router.get('/libraryapi', Librarys)


module.exports = router;
