const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Translation Helper
async function translateText(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data[0].map(x => x[0]).join('');
  } catch (error) {
    console.error('Translation Error:', error);
    return text; // Return original if failed
  }
}

app.post('/api/translate', async (req, res) => {
  const { text, target } = req.body;
  if (!text || !target) return res.status(400).json({ error: 'Missing text or target' });

  const translated = await translateText(text, target);
  res.json({ translated });
});

// AI Proxy Endpoints
app.post('/api/ai/test', async (req, res) => {
  const { provider, key } = req.body;

  try {
    let success = false;
    if (provider === 'gemini') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
      });
      success = response.ok;
      if (!success) {
        const data = await response.json();
        console.error('Gemini Test Error:', JSON.stringify(data, null, 2));
        return res.status(400).json({ error: data.error?.message || 'Gemini API Error' });
      }
    } else if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      success = response.ok;
    } else if (provider === 'deepseek') {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      success = response.ok;
    }

    if (success) res.json({ success: true });
    else res.status(400).json({ error: 'Invalid API Key' });
  } catch (error) {
    console.error('AI Test Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  const { provider, key, message } = req.body;

  try {
    let responseText = '';

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Gemini API Error:', JSON.stringify(data, null, 2));
        return res.status(response.status).json({ error: data.error?.message || 'Gemini API Error' });
      }

      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        console.error('Unexpected Gemini Response:', JSON.stringify(data, null, 2));
        return res.status(500).json({ error: 'Unexpected response format from Gemini' });
      }
    } else if (provider === 'gpt') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: message }]
        })
      });
      const data = await response.json();
      responseText = data.choices?.[0]?.message?.content || 'Error generating response';
    } else if (provider === 'deepseek') {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: message }]
        })
      });
      const data = await response.json();
      responseText = data.choices?.[0]?.message?.content || 'Error generating response';
    }

    res.json({ response: responseText });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: error.message });
  }
});


const DATA_DIR = path.join(__dirname, 'data');

// Get all categories
app.get('/articles/categories', (req, res) => {
  const filePath = path.join(DATA_DIR, 'categories.json');
  if (fs.existsSync(filePath)) {
    res.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
  } else {
    res.json([]);
  }
});

// Legacy endpoint for admin panel
app.get('/api/categories', (req, res) => {
  const filePath = path.join(DATA_DIR, 'categories.json');
  if (fs.existsSync(filePath)) {
    res.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
  } else {
    res.json([]);
  }
});

// Get articles by category (query param)
app.get('/articles', (req, res) => {
  const { categoryId } = req.query;
  if (!categoryId) {
    return res.status(400).json({ error: 'categoryId is required' });
  }
  const filePath = path.join(DATA_DIR, `${categoryId}.json`);
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(fileContent));
  } else {
    res.json([]);
  }
});

// Legacy endpoint for admin panel
app.get('/api/articles/:category', (req, res) => {
  const { category } = req.params;
  const filePath = path.join(DATA_DIR, `${category}.json`);
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(fileContent));
  } else {
    res.json([]);
  }
});

// Get single article by ID
app.get('/articles/:articleId', (req, res) => {
  const { articleId } = req.params;

  // Search through all category files
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && f !== 'categories.json');

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const articles = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
    const article = articles.find(a => a.id === articleId);
    if (article) {
      return res.json(article);
    }
  }

  res.status(404).json({ error: 'Article not found' });
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

const PORT = 8081;
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`\n🚀 Article Server is running!`);
  console.log(`📱 Local:    http://localhost:${PORT}/admin.html`);
  console.log(`📱 Network:  http://${localIP}:${PORT}/admin.html`);
  console.log(`\n💡 Access from phone: Use the Network URL on same WiFi\n`);
});
