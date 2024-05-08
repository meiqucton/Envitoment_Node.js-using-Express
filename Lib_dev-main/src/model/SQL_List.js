const connection = require('../config/SQL_User');
const connectionBook = require('../config/SQL_Product');
const Callback = {
  getAllCustomers: function(callback) {
    connection.query('SELECT * FROM LibCus', callback);
},
  getAllBooks: function(callback) {
    connectionBook.query('SELECT * FROM book_info', callback);
  }
};
module.exports = Callback;