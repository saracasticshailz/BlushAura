CREATE TABLE admin_users (
 email VARCHAR(254) PRIMARY KEY,
 password_hash VARCHAR(100) NOT NULL
);
CREATE TABLE categories (name VARCHAR(120) PRIMARY KEY);
CREATE TABLE subcategories (
 category VARCHAR(120) NOT NULL REFERENCES categories(name) ON UPDATE CASCADE ON DELETE CASCADE,
 name VARCHAR(120) NOT NULL,
 PRIMARY KEY (category, name)
);
INSERT INTO categories SELECT DISTINCT category FROM products;
INSERT INTO subcategories SELECT DISTINCT category, subcategory FROM products;
ALTER TABLE products ADD CONSTRAINT product_category_fk FOREIGN KEY (category, subcategory)
 REFERENCES subcategories(category, name) ON UPDATE CASCADE ON DELETE RESTRICT;
CREATE TABLE media (
 id UUID PRIMARY KEY,
 content_type VARCHAR(40) NOT NULL,
 data BYTEA NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE products ADD COLUMN image_url VARCHAR(100);
ALTER TABLE products ADD COLUMN stock INTEGER NOT NULL DEFAULT 25 CHECK (stock >= 0);
ALTER TABLE orders ADD COLUMN fulfillment VARCHAR(20) NOT NULL DEFAULT 'NEW'
 CHECK (fulfillment IN ('NEW','PROCESSING','SHIPPED','COMPLETED','CANCELLED'));
CREATE INDEX orders_created_at_idx ON orders(created_at DESC);
