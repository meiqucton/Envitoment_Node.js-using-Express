require('dotenv').config();
const paypal = require('paypal-rest-sdk');
  paypal.configure({
  'mode': 'sandbox', 
  'client_id': process.env.PAYPAL_ID, // Client ID của bạn từ PayPal
  'client_secret': process.env.PAYPAL_KEY // Client Secret từ PayPal

});
module.exports = paypal;