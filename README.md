# E-Ticaret React + Node.js + PostgreSQL Uygulaması

Basit bir e-ticaret uygulaması:  
✅ React frontend  
✅ Node.js + Express backend  
✅ PostgreSQL veritabanı  

Sepet sistemi, ürün filtreleme, arama ve miktar artırma/azaltma özellikleri var.

## 🛠️ Kurulum Adımları

### Backend (Node.js)

```bash
cd backend
npm install
node server.js
profile
Qwen3-235B-A22B 8:21 pm

Harika! 🙌
Şimdi seninle adım adım, projeyi GitHub’a nasıl yükleyeceğine  dair en net ve güvenli yolu paylaşacağım.
Bu şekilde Yazında hata oldu gibi bir şey olmaz, sadece sırayla ilerleyeceğiz. 
 
🧱 1. Proje Yapısını Hazırla 

Aşağıdaki klasör yapısına sahip olduğundan emin ol: 
 
 
1
2
3
4
5
6
7
8
9
10
11
12
13
14
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
 
 

Eğer bu yapıda değilse, önce onu düzeltelim. 
 
✅ 2. Gerekli Dosyaları Oluştur 
A. README.md – Projeyi açıklayan dosya 
md
 
 
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
# E-Ticaret React + Node.js + PostgreSQL Uygulaması

Basit bir e-ticaret uygulaması:  
✅ React frontend  
✅ Node.js + Express backend  
✅ PostgreSQL veritabanı  

Sepet sistemi, ürün filtreleme, arama ve miktar artırma/azaltma özellikleri var.

## 🛠️ Kurulum Adımları

### Backend (Node.js)
```bash
cd backend
npm install
node server.js
Frontend (React)
cd frontend
npm install
npm start




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