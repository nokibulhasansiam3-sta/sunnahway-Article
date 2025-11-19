const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

const DATA_DIR = path.join(__dirname, 'data');

// Get Articles by Category
app.get('/api/articles/:category', (req, res) => {
  const { category } = req.params;
  const filePath = path.join(__dirname, 'data', `${category}.json`);

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(fileContent));
  } else {
    res.json([]);
  }
});

// Get all categories
app.get('/api/categories', (req, res) => {
  const filePath = path.join(DATA_DIR, 'categories.json');
  if (fs.existsSync(filePath)) {
    res.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
  } else {
    res.json([]);
  }
});

// Add/Update category
app.post('/api/categories', (req, res) => {
  try {
    const newCategory = req.body;
    const filePath = path.join(DATA_DIR, 'categories.json');
    let categories = [];

    if (fs.existsSync(filePath)) {
      categories = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    // Check if exists
    const index = categories.findIndex(c => c.id === newCategory.id);
    if (index > -1) {
      categories[index] = newCategory;
    } else {
      categories.push(newCategory);
      // Create data file for new category
      const dataPath = path.join(DATA_DIR, `${newCategory.id}.json`);
      if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, '[]');
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(categories, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete category
app.post('/api/categories/delete', (req, res) => {
  try {
    const { id } = req.body;
    const filePath = path.join(DATA_DIR, 'categories.json');

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Categories file not found' });

    let categories = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    categories = categories.filter(c => c.id !== id);
    fs.writeFileSync(filePath, JSON.stringify(categories, null, 2));

    // Optionally delete the data file (or keep it as backup)
    const dataPath = path.join(DATA_DIR, `${id}.json`);
    if (fs.existsSync(dataPath)) {
      fs.unlinkSync(dataPath); // Delete the file
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save article
app.post('/api/save', async (req, res) => {
  try {
    const { category, article } = req.body;
    const filePath = path.join(DATA_DIR, `${category}.json`);

    let articles = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      articles = JSON.parse(content || '[]');
    }

    const index = articles.findIndex(a => a.id === article.id);
    if (index > -1) {
      articles[index] = article;
    } else {
      articles.push(article);
    }

    fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete article
app.post('/api/delete', async (req, res) => {
  try {
    const { category, id } = req.body;
    const filePath = path.join(__dirname, 'data', `${category}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Category file not found' });
    }

    let articles = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
    const initialLength = articles.length;
    articles = articles.filter(a => a.id !== id);

    if (articles.length === initialLength) {
      return res.status(404).json({ error: 'Article not found' });
    }

    fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Push to GitHub
app.post('/api/push', (req, res) => {
  exec('git add . && git commit -m "New article added via Admin Panel" && git push', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ success: false, message: stderr });
    }
    res.json({ success: true, message: 'Changes pushed to GitHub!' });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/admin.html`);
});
