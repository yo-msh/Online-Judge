const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', // Default PostgreSQL username
    host: 'localhost', // Database server
    database: 'coding_platform', // Database name
    password: 'qwerty1234', // Replace with your PostgreSQL password
    port: 5432, // Default PostgreSQL port
});

pool.connect((err) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } else {
        console.log('Connected to PostgreSQL');
    }
});

module.exports = pool;
