const mysql = require('mysql2/promise');
require('dotenv').config(); 

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: process.env.DB_PASSWORD, // Your MySQL password
    database: 'learning_app_db'
});

module.exports = pool;