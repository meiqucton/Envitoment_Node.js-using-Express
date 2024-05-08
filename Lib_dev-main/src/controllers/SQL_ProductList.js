const CallBack = require('../model/SQL_List');

const Books_Show = {
    getAllBooks: function(req, res) {
      CallBack.getAllBooks((err, book_info) => {
        if (err) {
          console.log('Error:', err);
          res.status(500).send('Internal Server Error(book_info)');
          return;
        }
        res.render('Book_show', {book_info});
      });
    }
  };
  module.exports = Books_Show;