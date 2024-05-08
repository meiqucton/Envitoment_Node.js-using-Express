
require('dotenv').config();

const APIOpenWeather = {
    method: 'GET',
    url: 'https://open-weather13.p.rapidapi.com/city/DaNang/AS',
    headers: {
      'X-RapidAPI-Key':  process.env.API_KEY || 'f6b42e1a89msh726a2c75ecd7060p1ba11ejsn247c6e67cd7b',
      'X-RapidAPI-Host': process.env.API_HOST_WEATHER || 'open-weather13.p.rapidapi.com'
    }
  };
const NewsPaper = {
    method: 'GET',
    url: 'https://google-news13.p.rapidapi.com/latest',
    params: {lr: 'en-US'},
    headers: {
      'X-RapidAPI-Key':  process.env.API_KEY ||'f6b42e1a89msh726a2c75ecd7060p1ba11ejsn247c6e67cd7b',
      'X-RapidAPI-Host': process.env.API_HOST_NEWPAPER ||'google-news13.p.rapidapi.com'
    }
  }; 
const Library = {
  method: 'GET',
  url: 'https://meta-ad-library.p.rapidapi.com/countries',
  headers: {
    'X-RapidAPI-Key': process.env.API_KEY,
    'X-RapidAPI-Host': process.env.API_KEY_NEWPAPER 
  }
}
module.exports = {APIOpenWeather, NewsPaper, Library};
