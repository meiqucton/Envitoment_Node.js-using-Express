
require('dotenv').config();
const mysql = require('mysql');

const connectionBook = mysql.createPool({
  host     : process.env.DB_HOST || 'localhost',
  user     : process.env.DB_USER || 'root', 
  password : process.env.DB_PASS || '123456789',
  database : process.env.DATABASE_BOOK || 'Book',
  connectionLimit: process.env.DB_CONNECTIONLIMIT || 120,
  maxIdle:process.env.DB_MAX_IDLE || 120, 
  idleTimeout:process.env.DB_IDLE_TIMEOU|| 32, 
  queueLimit: 0,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});
connectionBook.getConnection((err, conn) => { 
	if (err) {
	  console.error('Lỗi kết nối đến cơ sở dữ liệu MySQL:', err);
	  return;
	}
	console.log('Đã kết nối đến cơ sở dữ liệu MySQL:', conn.config.database);
	conn.release();
  });
  
  module.exports = connectionBook;