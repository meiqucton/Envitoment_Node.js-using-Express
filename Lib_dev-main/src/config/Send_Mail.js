require('dotenv').config();
const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, html) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.example.com",
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass:process.env.APP_PASSWORD,
      
        }
    })
    const message = {
        from: 'Mail by Ton',
        to: email,
        subject: subject,
        html: html
    }
    const result = await transporter.sendMail(message);
    return result;
};
module.exports = {
    sendEmail,
};