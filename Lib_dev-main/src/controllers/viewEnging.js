const path = require('path');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const flush = require('connect-flash');

const ViewEngine = (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride('_method'));

    app.set('view engine', 'ejs');
    app.set('views', path.join('./src', 'views'));

    app.use(express.static(path.join('./src', 'public')));
    app.use(session({
        secret: 'secret',
        cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
        resave: false,
        saveUninitialized: false,
    }));
    app.use(flush());
    app.use((req, res, next) => {
        res.locals.messages = req.flash(); // lưu tất cả các flash messages vào res.locals.messages
        next();
    });
};

module.exports = ViewEngine;
