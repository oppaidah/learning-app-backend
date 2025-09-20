const mysql = require('mysql2/promise');

// Create a connection pool. This is more efficient than creating a new connection
// for every single database query.
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Oo--..66', // Your MySQL password
    database: 'learning_app_db'
});

module.exports = pool;