const { resolve } = require('path');
const connectionBook = require('../config/SQL_Product');

class book_infoModel {
    static checkProduct(Book_id) {
        return new Promise((resolve, reject) => {
          connectionBook.query(
            'SELECT * FROM book_info WHERE Book_id = ?',
            [Book_id],
            (error, results) => {
              if (error) {
                reject(error);
              } else {
                resolve(results.length > 0);
              }
            }
          );
        });
      }
    static CreateProduct(Book_id, title, author, parentFolder, image) {
        return new Promise((resolve, reject) => {
          connectionBook.query(
              `INSERT INTO 
              book_info(Book_id ,title, author, parentFolder, image) 
              VALUES(?,?,?,?,?)`,
              [Book_id ,title, author, parentFolder, image],
              (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results);
                }
              }
            );
          
        });
      }
      static GetBooks(Book_id) {
        return new Promise((resolve, reject) => {
          connectionBook.query(
            'SELECT * FROM book_info WHERE Book_id = ?',
            [Book_id],
            (error, results, fields) => {
              if (error) {
                reject(error);
              } else {
                
                resolve(results.length > 0 ? results[0] : null);
              }
            }
          );
        });
      }
      static Update_Book(title, author, parentFolder, image, Book_id) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE book_info SET title = ?, author = ?, parentFolder = ?, image = ? WHERE Book_id = ?`;
            connectionBook.query(sql, [title, author, parentFolder, image, Book_id], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }
    static Delete_Book(Book_id){
      return new Promise((resolve, reject) => {
        connectionBook.query(
          'DELETE FROM book_info WHERE Book_id = ?',
          [Book_id],
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results.affectedRows > 0);
            }
          }
        );
      });
    }
    static Search_Book(author) {
      return new Promise((resolve, reject ) => {
        const SeachAuthor = `%${author}%`;
        connectionBook.query(
          `SELECT * FROM book_info WHERE author LIKE ?`,
          [SeachAuthor],
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results.length > 0? results : null);
            }
          }
        );
      });
    }
    // static Comments(Book_id, comments) {
    //   return new Promise((resolve, reject) => {
    //     connectionBook.query(
    //       `INSERT INTO book_info (Book_id, comments) VALUES (?, ?)`,
    //       [Book_id, comments],
    //       (error, results) => {
    //         if (error) {
    //           reject(error);
    //         } else {
    //           resolve(results);
    //         }
    //       }
    //     );
    //   });
    // };
  
}  
module.exports = book_infoModel;