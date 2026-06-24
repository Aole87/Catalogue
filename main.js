const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
let db;
(async () => {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  try {
    // Create new tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS car_brands (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          image_url TEXT
      );
      CREATE TABLE IF NOT EXISTS car_models (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          car_brand_id INTEGER,
          FOREIGN KEY (car_brand_id) REFERENCES car_brands(id) ON DELETE CASCADE,
          UNIQUE(name, car_brand_id)
      );
      CREATE TABLE IF NOT EXISTS car_years (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          year TEXT UNIQUE NOT NULL
      );
    `);

    // Safe migration for existing databases:
    try {
      await db.exec("ALTER TABLE car_brands ADD COLUMN image_url TEXT;");
    } catch (e) {
      // Column already exists, ignore
    }

    // Migrate existing data from products table if any
    const existingBrands = await db.all("SELECT DISTINCT car_brand FROM products WHERE car_brand IS NOT NULL AND car_brand != ''");
    for (const b of existingBrands) {
      await db.run("INSERT OR IGNORE INTO car_brands (name) VALUES (?)", [b.car_brand]);
    }

    const existingModels = await db.all("SELECT DISTINCT car_brand, car_model FROM products WHERE car_brand IS NOT NULL AND car_brand != '' AND car_model IS NOT NULL AND car_model != ''");
    for (const m of existingModels) {
      const brand = await db.get("SELECT id FROM car_brands WHERE name = ?", [m.car_brand]);
      if (brand) {
        await db.run("INSERT OR IGNORE INTO car_models (name, car_brand_id) VALUES (?, ?)", [m.car_model, brand.id]);
      }
    }

    const existingYears = await db.all("SELECT DISTINCT car_year FROM products WHERE car_year IS NOT NULL AND car_year != ''");
    for (const y of existingYears) {
      // Split comma separated or range years if necessary, but here we just import whatever exists
      await db.run("INSERT OR IGNORE INTO car_years (year) VALUES (?)", [y.car_year]);
    }
  } catch (err) {
    console.error("Migration error:", err);
  }
})();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In development, load from Vite dev server
  // win.loadURL('http://localhost:5173');
  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers for Database Operations
ipcMain.handle('db-query', async (event, { sql, params = [] }) => {
  try {
    if (!db) {
      db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
      });
    }
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return await db.all(sql, ...params);
    } else {
      return await db.run(sql, ...params);
    }
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
});
