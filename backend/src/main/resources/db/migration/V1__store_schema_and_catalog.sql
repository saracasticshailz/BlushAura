CREATE TABLE products (
 id VARCHAR(60) PRIMARY KEY, name VARCHAR(120) NOT NULL, subtitle VARCHAR(250) NOT NULL,
 category VARCHAR(120) NOT NULL, subcategory VARCHAR(120) NOT NULL,
 price NUMERIC(12,2) NOT NULL CHECK (price >= 0), original_price NUMERIC(12,2) NOT NULL CHECK (original_price >= 0),
 color VARCHAR(20) NOT NULL, kind VARCHAR(30) NOT NULL, badge VARCHAR(80), description TEXT NOT NULL,
 active BOOLEAN NOT NULL DEFAULT true, display_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE orders (
 id VARCHAR(60) PRIMARY KEY, status VARCHAR(30) NOT NULL CHECK (status = 'MOCK_CONFIRMED'),
 currency VARCHAR(3) NOT NULL, subtotal NUMERIC(12,2) NOT NULL, shipping NUMERIC(12,2) NOT NULL,
 total NUMERIC(12,2) NOT NULL, payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('card','paypal')),
 customer_name VARCHAR(120) NOT NULL, email VARCHAR(254) NOT NULL, street VARCHAR(300) NOT NULL,
 city VARCHAR(100) NOT NULL, postal VARCHAR(20) NOT NULL, country VARCHAR(100) NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE order_items (
 order_id VARCHAR(60) NOT NULL REFERENCES orders(id), product_id VARCHAR(60) NOT NULL REFERENCES products(id),
 product_name VARCHAR(120) NOT NULL, quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 99),
 unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0), PRIMARY KEY (order_id, product_id)
);
INSERT INTO products (id,name,subtitle,category,subcategory,price,original_price,color,kind,badge,description,display_order) VALUES ('aura','Aura','Your everyday massage companion','Massagers','Wand massagers',2499,3299,'#b56a7d','wand','BESTSELLER','Meet your new unwinding ritual. A beautifully soft, rechargeable massage wand with 8 intensity settings, a flexible neck, and a quiet motor. Designed for relaxed shoulders, tired muscles, and a little well-deserved me-time.',0);
INSERT INTO products (id,name,subtitle,category,subcategory,price,original_price,color,kind,badge,description,display_order) VALUES ('glow','Golden Hour','Nourishing body & massage oil · 100 ml','Oils & essentials','Massage oils',899,1199,'#b77a32','oil','COMMUNITY FAVOURITE','Slow down with a silky blend of botanical oils and a warm, softly scented finish. A little goes a long way: warm a few drops between your palms and massage gently into skin. Patch test before use.',1);
INSERT INTO products (id,name,subtitle,category,subcategory,price,original_price,color,kind,badge,description,display_order) VALUES ('pebble','Pebble','Small in size. Big on relaxation.','Massagers','Palm massagers',1799,2299,'#aa887c','pebble','NEW ARRIVAL','Made to fit naturally in your palm, Pebble brings targeted massage to everyday moments. Choose from 6 patterns with a single button. USB rechargeable, easy to clean, and easy to take along.',2);
INSERT INTO products (id,name,subtitle,category,subcategory,price,original_price,color,kind,badge,description,display_order) VALUES ('ritual','The Unwind Ritual','A little box of feel-good moments','Bundles & gifts','Gift sets',2999,3999,'#b47780','bundle','SAVE 25%','The invitation to switch off you have been waiting for. A curated gift set with our Golden Hour massage oil, a softly scented candle, and a soft eye mask. Beautifully packed for someone special — including you.',3);
INSERT INTO products (id,name,subtitle,category,subcategory,price,original_price,color,kind,badge,description,display_order) VALUES ('candle','Slow Sundays','A warm, comforting scented candle · 180 g','Oils & essentials','Candles',799,999,'#cead85','candle',NULL,'Set the tone for a slower evening with notes of vanilla and sandalwood. A cotton wick and soy wax blend offer a gentle glow. Burn on a heat-resistant surface and never leave unattended.',4);
INSERT INTO products (id,name,subtitle,category,subcategory,price,original_price,color,kind,badge,description,display_order) VALUES ('duo','Better Together','A shared moment, beautifully boxed','Bundles & gifts','Gift sets',3799,4799,'#a97b88','bundle',NULL,'Two favourites, one thoughtful gift. Our Aura massage wand and Golden Hour oil are bundled together for evenings that deserve a little extra care.',5);
