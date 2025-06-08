// db.js
const mysql = require('mysql2/promise');
const config = require('./config.js');

const pool = mysql.createPool({
  host: config.db_host,
  user: config.db_user,
  password: config.db_pass,
  database: config.db_name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
