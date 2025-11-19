const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

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

// Save or Update Article
app.post('/api/save', (req, res) => {
  const { category, article } = req.body;
  const filePath = path.join(__dirname, 'data', `${category}.json`);

  try {
    let articles = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      articles = JSON.parse(fileContent);
    }

    // Check if article exists
    const index = articles.findIndex(a => a.id === article.id);

    if (index !== -1) {
      // Update existing
      articles[index] = article;
    } else {
      // Add new
      articles.push(article);
    }

    fs.writeFileSync(filePath, JSON.stringify(articles, null, 2), 'utf8');
    res.json({ success: true, message: 'Article saved locally!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
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
