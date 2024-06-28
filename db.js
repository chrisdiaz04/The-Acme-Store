const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function createTables() {
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(100) NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        product_id UUID REFERENCES products(id),
        CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
      );
    `);
    console.log('Tables created successfully.');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    await client.end();
  }
}

async function createProduct(name, price) {
  await client.connect();
  try {
    const productId = uuidv4();
    const result = await client.query(
      'INSERT INTO products (id, name, price) VALUES ($1, $2, $3) RETURNING *',
      [productId, name, price]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Error creating product:', err);
  } finally {
    await client.end();
  }
}

async function createUser(username, password) {
  await client.connect();
  try {
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      'INSERT INTO users (id, username, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [userId, username, hashedPassword]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Error creating user:', err);
  } finally {
    await client.end();
  }
}

async function fetchUsers() {
  await client.connect();
  try {
    const result = await client.query('SELECT * FROM users');
    return result.rows;
  } catch (err) {
    console.error('Error fetching users:', err);
  } finally {
    await client.end();
  }
}

async function fetchProducts() {
  await client.connect();
  try {
    const result = await client.query('SELECT * FROM products');
    return result.rows;
  } catch (err) {
    console.error('Error fetching products:', err);
  } finally {
    await client.end();
  }
}

async function createFavorite(userId, productId) {
  await client.connect();
  try {
    const favoriteId = uuidv4();
    const result = await client.query(
      'INSERT INTO favorites (id, user_id, product_id) VALUES ($1, $2, $3) RETURNING *',
      [favoriteId, userId, productId]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Error creating favorite:', err);
  } finally {
    await client.end();
  }
}

async function fetchFavorites(userId) {
  await client.connect();
  try {
    const result = await client.query(
      'SELECT * FROM favorites WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  } catch (err) {
    console.error('Error fetching favorites:', err);
  } finally {
    await client.end();
  }
}

async function destroyFavorite(userId, favoriteId) {
  await client.connect();
  try {
    await client.query(
      'DELETE FROM favorites WHERE id = $1 AND user_id = $2',
      [favoriteId, userId]
    );
  } catch (err) {
    console.error('Error deleting favorite:', err);
  } finally {
    await client.end();
  }
}

module.exports = {
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
};
