const Book_Mongoodb = require('../model/Mongoo_Product');

const AddBook = async(req, res) =>{
    const {BookTitle, Author,About,Year,Adress} = req.body;
    if(BookTitle && About && Year && Adress && About){
    try{
        const validAuthor = /^[a-zA-Z\s]+$/; // Updated regex to allow spaces in author name
        const date = new Date(Year);
        const currentYear = date.getFullYear();
       if (!validAuthor.test(Author)) {
            req.flash('error','Tên Tác giả không đúng định dạng');
            return res.redirect('/Addbook');
        }
        else if (Year > currentYear){
            res.send('Năm sáng tác không hợp lệ');
        }
        else{
            const newBook = await Book_Mongoodb.AddBook({BookTitle, Author,About,Year,Adress});
            console.log(`Đã update thành công với sách có id ${newBook}`);
            req.flash('success', `Đã update thành công với sách có Tên [${BookTitle}]`);
            return res.redirect('/Addbook');
            //res.send('success');
        }
    }catch(err){
        console.log(err);
        res.status(500).send('Lỗi máy chủ nội Của Add book');
    }}else{
       req.flash('error', 'Vui lòng nhập thông tin sách');
       return res.redirect('/Addbook');
    }
};
// Delete function 
const get_delete = async (req, res) => {
    const _id = req.params._id;
    try {
        const book = await Book_Mongoodb.Get_id(_id); 
            res.render('MgDel', { 
                Book_id: book._id,
                BookTitle: book.BookTitle,
                Author: book.Author,
                Year: book.Year,
                About: book.About,
                Address: book.Adress
            });
       
    } catch (err) {
        console.log(err);
        res.status(500).send('Lỗi máy chủ khi tìm kiếm sách');
    }
};

const Del_book = async (req, res) => {
    try {
        const _id = req.params._id;
        const dele_book = await Book_Mongoodb.Del_book(_id);
        if (dele_book) {
            console.log(`Xóa sách thành công với ID ${_id}`);
            req.flash('success', 'Xoá Sách thành công');
            return res.redirect('/FindBook')
        } else {
            req.flash('error', 'Xoá sách thất bại')   
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Lỗi máy chủ Delete');
    }
};
//Update function
const get_update = async (req, res) => {
    const _id = req.params._id;
    
    try {
        const book = await Book_Mongoodb.Get_id(_id); // Lấy thông tin sách từ database
        
            res.render('MgUpdate', { 
                Book_id: book._id,
                BookTitle: book.BookTitle,
                Author: book.Author,
                Year: book.Year,
                About: book.About,
                Address: book.Adress
            });
       
    } catch (err) {
        console.log(err);
        res.status(500).send('Lỗi máy chủ khi tìm kiếm sách');
    }
};
const Update_Book = async (req, res) => {
    const _id = req.params._id;
    const { Author, Year } = req.body;
    const validAuthor = /^[a-zA-Z\s]+$/;
    const date = new Date(Year);
    const currentYear = date.getFullYear();
    const UpdatedFields = req.body;

    try {
        if (!validAuthor.test(Author)) {
            req.flash('error', 'Tên Tác giả không đúng định dạng');
            return res.redirect(`/UpdateBook/${_id}`);
        } else if (Year > currentYear) {
            req.flash('error', 'Năm sáng tác không hợp lệ');
            return res.redirect(`/UpdateBook/${_id}`);
        }

        const result = await Book_Mongoodb.Update_Book(_id, UpdatedFields);

        if (result) {
            req.flash('success', `Cập nhật thành công `);
            return res.redirect(`/UpdateBook/${_id}`); // Chuyển hướng người dùng trở lại trang cập nhật với thông báo thành công
        } else {
             req.flash('error', `Cập nhật sách thất bại `);
            return res.redirect(`/UpdateBook/${_id}`); // Chuyển hướng người dùng trở lại trang cập nhật với thông báo thành công
        }
    } catch (err) {
        console.log(err);
        req.flash('error', 'Lỗi máy chủ nội bộ khi cập nhật sách');
        return res.status(500).send('Lỗi máy chủ nội bộ khi cập nhật sách');
    }
};
// Find function
const Find_Book_Title = async (req, res) => {
    try{
        
        const NameTitle = req.query.BookTitle;
        const foundBook = await Book_Mongoodb.Find_Book(NameTitle);

            res.render('MgFind', { Books: foundBook, FindTitle: NameTitle });
        
    }catch(err){
        console.log(err);
        res.status(500).send('Lỗi máy chủ nội Của Find book');
    }; 
}
// List_book
const List_books = async (req, res) => {
    try {
        const books = await Book_Mongoodb.List_Book();
        res.render('MgList', {
            books:books,
            Book_id: books._id,
            BookTitle: books.BookTitle,
            Author: books.Author,
            Year: books.Year,
            About: books.About,
            Address: books.Adress    
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Lỗi máy chủ nội Của List book');
    }
}

module.exports = {
    AddBook,
    get_delete,
    Del_book,
    Find_Book_Title,
    Update_Book,
    get_update,
    List_books,
}