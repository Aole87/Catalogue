-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL, -- 'superadmin', 'editor'
    permissions TEXT -- JSON string of permissions
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_url TEXT
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_url TEXT
);

-- Car Brands table
CREATE TABLE IF NOT EXISTS car_brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Car Models table
CREATE TABLE IF NOT EXISTS car_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    car_brand_id INTEGER,
    FOREIGN KEY (car_brand_id) REFERENCES car_brands(id) ON DELETE CASCADE,
    UNIQUE(name, car_brand_id)
);

-- Car Years table
CREATE TABLE IF NOT EXISTS car_years (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year TEXT UNIQUE NOT NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id INTEGER,
    brand_id INTEGER,
    car_brand TEXT,
    car_model TEXT,
    car_year TEXT,
    price_garage REAL,
    price_shop REAL,
    price_general REAL,
    images TEXT, -- JSON array of image URLs
    specifications TEXT, -- JSON object
    cross_references TEXT, -- JSON array
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (brand_id) REFERENCES brands(id)
);

-- Users (Members) table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    business_name TEXT,
    business_type TEXT, -- 'Garage', 'Shop', 'General'
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_verified INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table for dashboard
CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    target_type TEXT, -- 'product', 'category'
    target_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed initial admin
INSERT OR IGNORE INTO admins (username, password, role) VALUES ('admin', 'admin123', 'superadmin');
