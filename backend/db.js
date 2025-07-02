// backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ecommerce',
  password: '123', // Şifreni buraya yaz
  port: 5432
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};