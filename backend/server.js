require('dotenv').config(); // En üste eklenecek



const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 5000;

// PostgreSQL bağlantısı
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });
  

app.use(cors());
app.use(express.json());

// 🚪 Root endpoint (http://localhost:5000/)
app.get('/', (req, res) => {
  res.send(`
    <h1>Backend çalışıyor</h1>
    <p>API adresleri:</p>
    <ul>
      <li><a href="/api/products">/api/products</a></li>
      <li><a href="/api/categories">/api/categories</a></li>
      <li><a href="/api/cart">/api/cart</a></li>
    </ul>
  `);
});

// 🛒 Sepete ekle
app.post('/api/cart', async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id || typeof product_id !== 'number') {
    return res.status(400).send('Geçersiz ürün ID');
  }

  try {
    const existing = await pool.query(
      'SELECT * FROM cart_items WHERE product_id = $1',
      [product_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE product_id = $2',
        [quantity, product_id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart_items (product_id, quantity) VALUES ($1, $2)',
        [product_id, quantity]
      );
    }

    const updatedCart = await pool.query(`
      SELECT p.id as product_id, p.name, p.price, p.image_url, ci.quantity, ci.id as cart_item_id
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
    `);

    res.json(updatedCart.rows);
  } catch (err) {
    console.error("Sepete eklenemedi:", err.message);
    res.status(500).send('Sunucu hatası: ' + err.message);
  }
});

// 🛒 Sepeti getir
app.get('/api/cart', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id as product_id, p.name, p.price, p.image_url, ci.quantity, ci.id as cart_item_id
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Sepet getirilemedi:", err.message);
    res.status(500).send('Sunucu hatası: ' + err.message);
  }
});

// 🛒 Sepetten miktarı güncelle
app.put('/api/cart/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || typeof quantity !== 'number' || isNaN(quantity)) {
    return res.status(400).send('Geçersiz miktar');
  }

  try {
    if (quantity < 1) {
      await pool.query('DELETE FROM cart_items WHERE id = $1', [id]);
    } else {
      await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, id]);
    }

    const updatedCart = await pool.query(`
      SELECT p.id as product_id, p.name, p.price, p.image_url, ci.quantity, ci.id as cart_item_id
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
    `);

    res.json(updatedCart.rows);
  } catch (err) {
    console.error("Miktar güncellenemedi:", err.message);
    res.status(500).send('Sunucu hatası: ' + err.message);
  }
});

// 🗑️ Sepetten ürünü sil
app.delete('/api/cart/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM cart_items WHERE id = $1', [id]);

    const updatedCart = await pool.query(`
      SELECT p.id as product_id, p.name, p.price, p.image_url, ci.quantity, ci.id as cart_item_id
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
    `);

    res.json(updatedCart.rows);
  } catch (err) {
    console.error("Silinemedi:", err.message);
    res.status(500).send('Sunucu hatası: ' + err.message);
  }
});

// 📦 Ürünleri getir
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error("Ürünler getirilemedi:", err.message);
    res.status(500).send('Sunucu hatası: ' + err.message);
  }
});

// 🏷️ Kategorileri getir
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows.map(cat => ({ id: cat.id, name: cat.name })));
  } catch (err) {
    console.error("Kategoriler getirilemedi:", err.message);
    res.status(500).send('Sunucu hatası: ' + err.message);
  }
});

// 🚪 Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Backend çalışıyor: http://localhost:${PORT}`);
});