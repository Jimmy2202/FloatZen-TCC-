const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1967',
    database: 'music_project'
}).promise(); // Adiciona o .promise() aqui

module.exports = connection