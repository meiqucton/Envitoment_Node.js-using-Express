const homeController = {
    showHome: (req, res) => {
      if (req.session.loggedin) {
        res.render(`Home`);
      } else {
        res.render('Oripage');
      }
    },
  };
  
  module.exports = homeController;