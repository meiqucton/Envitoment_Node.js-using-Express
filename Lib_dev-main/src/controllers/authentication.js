
const requireLogin = (req, res, next) => {
  if (!req.session.userData) {
    res.redirect('/'); 

  } else {
      return next();

  }
};

  
  module.exports = { requireLogin };