const CallBack = require('../model/SQL_List');

const Cus_Show = {
    getAllCustomers: function(req, res) {
      CallBack.getAllCustomers((err, LibCus) => {
        if (err) {
          console.log('Error:', err);
          res.status(500).send('Internal Server Error(Customers)');
          return;
        }
        res.render('Cus_Show', {LibCus});
      });
    }
  };module.exports = Cus_Show;