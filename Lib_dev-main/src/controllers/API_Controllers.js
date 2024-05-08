const axios = require('axios');
const {APIOpenWeather, NewsPaper, Library} = require('../config/APIs');

const OpenWeather = async(req, res, next) => {
    try{
       const respond = await axios.request(APIOpenWeather);
       const apiWeather = respond.data;
       res.render('OpenWeather', {apiWeather});
    }catch(err){
        console.log(err);
        res.status(500).send('Lỗi máy chủ nội bộ');
        console.log('SHoww err', err);
    }

}
const GoogleNews = async(req, res, next) => {
    try{
       const respond = await axios.request(NewsPaper);
       const apiNewsPaper = respond.data;
       res.render('NewsPaper', {apiNewsPaper});
    }catch(err){
        console.log(err);
        res.status(500).send('Lỗi máy chủ nội bộ');
        console.log('SHoww err', err);
    }
}
const Librarys = async(req, res, next) => {
    try{
       const respond = await axios.request(Library);
       const book = respond.data;
       res.render('Library', {book});
    }catch(err){
        console.log(err);
        res.status(500).send('Lỗi máy chủ nội bộ');
        console.log('SHoww err', err);
    }
}
module.exports = {OpenWeather, GoogleNews, Librarys};