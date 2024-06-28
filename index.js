const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Initialize routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.fetchUsers();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await db.fetchProducts();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/:id/favorites', async (req, res) => {
  const userId = req.params.id;
  try {
    const favorites = await db.fetchFavorites(userId);
    res.json(favorites);
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users/:id/favorites', async (req, res) => {
  const userId = req.params.id;
  const { product_id } = req.body;
  try {
    const favorite = await db.createFavorite(userId, product_id);
    res.status(201).json(favorite);
  } catch (err) {
    console.error('Error creating favorite:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/users/:userId/favorites/:id', async (req, res) => {
  const userId = req.params.userId;
  const favoriteId = req.params.id;
  try {
    await db.destroyFavorite(userId, favoriteId);
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting favorite:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

db.createTables(); 

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
