CREATE DATABASE IF NOT EXISTS kriya_kita CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kriya_kita;
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS order_items, orders, cart_items, carts, products, categories, users;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE users (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(80) NOT NULL UNIQUE,
 email VARCHAR(150) NOT NULL UNIQUE,
 password VARCHAR(255) NOT NULL,
 role ENUM('user','admin') NOT NULL DEFAULT 'user',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE categories (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(80) NOT NULL UNIQUE,
 description VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE products (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 category_id INT UNSIGNED NOT NULL,
 name VARCHAR(150) NOT NULL,
 description TEXT NULL,
 price DECIMAL(15,2) NOT NULL DEFAULT 0,
 stock INT UNSIGNED NOT NULL DEFAULT 0,
 image TEXT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_products_category FOREIGN KEY(category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
 INDEX idx_products_category(category_id)
) ENGINE=InnoDB;

CREATE TABLE carts (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id INT UNSIGNED NOT NULL UNIQUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_carts_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 cart_id INT UNSIGNED NOT NULL,
 product_id INT UNSIGNED NOT NULL,
 quantity INT UNSIGNED NOT NULL DEFAULT 1,
 CONSTRAINT fk_cart_items_cart FOREIGN KEY(cart_id) REFERENCES carts(id) ON DELETE CASCADE,
 CONSTRAINT fk_cart_items_product FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE RESTRICT,
 UNIQUE KEY uq_cart_product(cart_id,product_id)
) ENGINE=InnoDB;

CREATE TABLE orders (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id INT UNSIGNED NOT NULL,
 recipient_name VARCHAR(100) NOT NULL,
 phone VARCHAR(30) NOT NULL,
 address TEXT NOT NULL,
 payment_method ENUM('bank_transfer','cod','ewallet') NOT NULL,
 total DECIMAL(15,2) NOT NULL,
 status ENUM('pending','processing','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_orders_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE RESTRICT,
 INDEX idx_orders_user(user_id), INDEX idx_orders_status(status)
) ENGINE=InnoDB;

CREATE TABLE order_items (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 order_id INT UNSIGNED NOT NULL,
 product_id INT UNSIGNED NULL,
 product_name VARCHAR(150) NOT NULL,
 price DECIMAL(15,2) NOT NULL,
 quantity INT UNSIGNED NOT NULL,
 CONSTRAINT fk_order_items_order FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
 CONSTRAINT fk_order_items_product FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO users(name,email,password,role) VALUES
('admin.admin','admin@kriyakita.local','$2y$10$XvOf/B7kWgb/9cqwJiOBEuRxrr29Xj2N2Ei922Winw5V8qYRvQHCu','admin');

INSERT INTO categories(name,description) VALUES
('Batik','Karya batik handmade dari pengrajin lokal.'),
('Rajut','Produk rajut yang dibuat secara teliti dan nyaman digunakan.'),
('Jahit','Pakaian dan aksesori hasil jahitan rumahan.'),
('Aksesori','Aksesori kecil handmade untuk melengkapi gaya.'),
('Dekorasi','Kerajinan untuk mempercantik ruang dan meja kerja.');

INSERT INTO products(category_id,name,description,price,stock,image) VALUES
(1,'Kemeja Batik Sekar','Kemeja batik motif sekar dengan bahan katun premium, nyaman untuk acara formal maupun santai.',289000,12,'/images/batik.svg'),
(2,'Tas Rajut Senja','Tas rajut handmade dengan bentuk compact dan kuat untuk aktivitas harian.',179000,18,'/images/rajut.svg'),
(3,'Tote Bag Kanvas Jahit','Tote bag jahitan tangan dengan lapisan dalam dan kantong kecil.',129000,25,'/images/jahit.svg'),
(4,'Gelang Manik Nusantara','Gelang manik handmade dengan perpaduan warna hangat dan detail sederhana.',59000,30,'/images/aksesori.svg'),
(5,'Hiasan Meja Kayu','Dekorasi meja dari kayu ringan dengan ukiran geometris sederhana.',99000,14,'/images/dekorasi.svg'),
(2,'Cardigan Rajut Pagi','Cardigan rajut lembut dengan model longgar untuk suasana santai.',249000,10,'/images/cardigan.svg');


