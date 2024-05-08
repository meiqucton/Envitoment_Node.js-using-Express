const connection = require('../config/SQL_User');

class AccountModel {
  // POST
  static Signinlog(Gmail, password) {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM LibCus WHERE Gmail = ? AND password = ?',
        [Gmail, password ],
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

  static checkGmail(Gmail) {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM LibCus WHERE Gmail = ?',
        [Gmail],
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

  static Signuplog(UserName, password, Gmail, BirthDay, Phone) {
    return new Promise((resolve, reject) => {
          connection.query(
          `INSERT INTO 
          LibCus(UserName, password, Gmail, BirthDay, Phone) 
          VALUES(?,?,?,?,?)`,
          [UserName, password, Gmail, BirthDay, Phone],
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
  static GetCustom(CustomId) {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM LibCus WHERE CustomId = ?',
        [CustomId ],
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
  static Update_cus(UserName, Gmail, BirthDay, Phone, CustomId) {
    return new Promise((resolve, reject) => {
          connection.query(
            `UPDATE LibCus SET UserName = ?, Gmail = ?, BirthDay = ?, 
            Phone = ?
            WHERE CustomId = ?`,
          [UserName, Gmail, BirthDay, Phone, CustomId],
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
  static Delete_cus(CustomId) {
    return new Promise((resolve, reject) => {
      connection.query(
        'DELETE FROM LibCus WHERE CustomId = ?',
        [CustomId],
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
  static Find_cus(CustomId) {
    return new Promise((resolve, reject ) => {
      const SeachId = `%${CustomId}%`;
      connection.query(
        `SELECT * FROM LibCus WHERE CustomId LIKE ?`,
        [SeachId],
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
  // static Your_profile(CustomId) {
  //   return new Promise((resolve, reject) => {
  //     connection.query(
  //       `SELECT UserName, Gmail, Phone, BirthDay
  //       FROM LibCus
  //       WHERE CustomId = ?`,
  //       [CustomId],
  //       (error, results) => {
  //         if (error) {
  //           reject(error);
  //         } else {
  //           resolve(results.length > 0 ? results[0] : null);
  //         }
  //       }
  //     );
  //   });
  // }
  

}



module.exports = AccountModel;