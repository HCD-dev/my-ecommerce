# E-Ticaret React + Node.js + PostgreSQL Uygulaması

Basit bir e-ticaret uygulaması:  
✅ React frontend  
✅ Node.js + Express backend  
✅ PostgreSQL veritabanı  

Sepet sistemi, ürün filtreleme, arama ve miktar artırma/azaltma özellikleri var.



my-ecommerce/
├── backend/
│   ├── server.js
│   ├── db.js (veya .env)
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   └── package.json
├── README.md
├── .gitignore
└── .git/ (olmayabilir - Git kurduktan sonra oluşur)
 
 
Veritabanı Tabloları
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    stock INT NOT NULL DEFAULT 0,
    category_id INT REFERENCES categories(id)
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
