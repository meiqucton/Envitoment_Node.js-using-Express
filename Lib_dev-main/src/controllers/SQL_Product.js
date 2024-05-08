const { get } = require('mongoose');
const book_infoModel = require('../model/SQL_Book');

const Addbooks = async (req, res) => {
  const { Book_id, title, author, parentFolder, image } = req.body;

  if (Book_id && title && author && parentFolder && image) {
    try {
      const isExist = await book_infoModel.checkProduct(Book_id);
      const validAuthor = /^[a-zA-Z\s]+$/; // Updated regex to allow spaces in author name

      if (isExist) {
        res.send(`Id sách đã bị trùng`);
      } else if (!validAuthor.test(author)) {
        res.send('Tên Tác giả không đúng định dạng');
      } else {
        await book_infoModel.CreateProduct(Book_id, title, author, parentFolder, image);
        res.send(`Thành công`);
      }
    } catch (error) {
      console.error('Lỗi trong quá trình thêm mới sản phẩm:', error);
      res.status(500).send('Lỗi máy chủ nội bộ');
    }
  } else {
    res.status(400).send('Thiếu thông tin cần thiết để thêm sách mới');
  }
};
const GetBook = async(req, res) => {
  const EditBooks = req.params.Book_id;
  try{
    const GetBookdEdit = await book_infoModel.GetBooks(EditBooks);
    res.render('EditBooks', {GetBookdINFO: GetBookdEdit});
  }catch(err){
    console.log(err);
    res.status(500).send('Lỗi máy chủ nội bộ');
    console.log('SHoww err', err);
  }
};

const Update_Books = async(req, res) => {
  try{
    let Book_id = req.body.Book_id;
    let title = req.body.title;
    let author = req.body.author;
    let parentFolder = req.body.parentFolder;
    let image = req.body.image;
    const updatedBook = await book_infoModel.Update_Book(title, author, parentFolder, image, Book_id);
    if (updatedBook) {
      console.log("Cập nhật sách thành công");
      res.redirect('/Book_show');
  } else {
      res.status(500).send('Cập nhật sách thất bại');
  }
} catch (error) {
  console.log(error);
  res.status(500).send('Lỗi máy chủ nội bộ');
}
};
const GetBook_del = async(req, res) => {
  const GetBookdel = req.params.Book_id;
  try{
    const GetBookdEdit = await book_infoModel.GetBooks(GetBookdel);
    res.render('Del_books', {GetBookdINFO: GetBookdEdit});
  }catch(err){
    console.log(err);
    res.status(500).send('Lỗi máy chủ nội bộ');
    console.log('SHoww err', err);
  }
}
const DeleteBook = async(req, res, next) => {
  try{
    let Book_id = req.params.Book_id;
    const deletedBook = await book_infoModel.Delete_Book(Book_id);
    if (deletedBook) {
      console.log("Xóa sách thành công");
      res.redirect('/Book_show');
  } else {
      res.status(500).send('Xóa sách thất bại');
  }
} catch(err){
    console.log(err);
    res.status(500).send('Lỗi máy chủ nội bộ');
    console.log('SHoww err', err);
}
};
const Search_Book = async (req, res, next) => {
  const { author } = req.query;
  try {
      const results = await book_infoModel.Search_Book(author);

      if (results && results.length > 0) {
          res.render('FindAuthor', { results: results });
      } else {
          res.render('FindAuthor', { results: [] }); // Pass an empty array if no results found
      }
  } catch (err) {
      console.error('Error searching books:', err);
      res.status(500).send('Internal Server Error');
  }
};
const GetBook_comment = async(req, res) => {
  const EditBooks = req.params.Book_id;
  try{
    const GetBook_comment = await book_infoModel.GetBooks(EditBooks);
    res.render('Comment_book', {GetBook_comment: GetBook_comment});
  }catch(err){
    console.log(err);
    res.status(500).send('Lỗi máy chủ nội bộ');
    console.log('SHoww err', err);
  }
};



module.exports = { Addbooks, GetBook, Update_Books, GetBook_del, DeleteBook, Search_Book, GetBook_comment};
