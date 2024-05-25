require('dotenv').config();
const { APIOpenWeather } = require('../config/APIs');

const OpenWeather = async (req, res, next) => {
    const apiweather = process.env.API_KEY_WEATHER;
    const city = req.body.city;
    var currentDate = new Date();    

    if (!city) {
        req.flash('error', 'Vui lòng nhập tên thành phố');
        return res.redirect('/');
    }

    try {
        const theWeather = await APIOpenWeather(city, apiweather);
        var formattedDate = currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear();

        if (!theWeather || theWeather.cod === 404) {
            req.flash('error', 'Không tìm thấy thông tin cho thành phố này');
            return res.redirect('/pageWeather');
        } else {
            res.render('searchWeather', { theWeather, formattedDate });
        }
    } catch (err) {
        console.error('Error calling API OpenWeather:', err);
        res.status(500).send('Lỗi máy chủ nội bộ của OpenWeather');
    }
}

module.exports = { OpenWeather };
