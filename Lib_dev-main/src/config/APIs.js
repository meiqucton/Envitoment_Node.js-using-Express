require('dotenv').config();
const axios = require('axios');

const APIOpenWeather = async (city, apiKey) => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    try {
        if(city === undefined){
            return false;
        }
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (err) {
        console.log("Error fetching weather API");
        console.error('Error:', err);
    }
};

module.exports = { APIOpenWeather };
