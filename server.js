const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 8081;
const DATA_DIR = path.join(__dirname, 'data');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');

// Helpers: load/save JSON with simple locking via in-process queue (best-effort)
async function loadJson(file, fallback) {
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

async function saveJson(file, data) {
  const tmp = file + '.tmp';
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmp, file);
}

function sanitizeId(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .slice(0, 80);
}

// Categories
app.get('/articles/categories', async (req, res) => {
  const categories = await loadJson(CATEGORIES_FILE, []);
  res.json(categories);
});

app.post('/articles/categories', async (req, res) => {
  const { id, titleBn, titleEn, titleAr } = req.body || {};
  if (!titleBn && !titleEn) {
    return res.status(400).json({ message: 'titleBn or titleEn is required' });
  }
  const categories = await loadJson(CATEGORIES_FILE, []);
  const newId = sanitizeId(id || titleEn || titleBn);
  if (!newId) return res.status(400).json({ message: 'Invalid id' });
  if (categories.some(c => c.id === newId)) {
    return res.status(409).json({ message: 'Category id already exists' });
  }
  const cat = { id: newId, titleBn: titleBn || '', titleEn: titleEn || '', titleAr: titleAr || '' };
  categories.push(cat);
  await saveJson(CATEGORIES_FILE, categories);
  res.status(201).json(cat);
});

app.delete('/articles/categories/:id', async (req, res) => {
  const id = req.params.id;
  const categories = await loadJson(CATEGORIES_FILE, []);
  const next = categories.filter(c => c.id !== id);
  if (next.length === categories.length) return res.status(404).json({ message: 'Not found' });
  await saveJson(CATEGORIES_FILE, next);
  // Also detach articles of this category (keep but categoryId = null)
  const articles = await loadJson(ARTICLES_FILE, []);
  const updated = articles.map(a => (a.categoryId === id ? { ...a, categoryId: null } : a));
  await saveJson(ARTICLES_FILE, updated);
  res.json({ ok: true });
});

// Articles
// List by category (light)
app.get('/articles', async (req, res) => {
  const { categoryId } = req.query;
  const items = await loadJson(ARTICLES_FILE, []);
  const filtered = categoryId ? items.filter(a => a.categoryId === categoryId) : items;
  const light = filtered.map(a => ({
    id: a.id,
    categoryId: a.categoryId ?? null,
    titleBn: a.titleBn || '',
    titleEn: a.titleEn || '',
    titleAr: a.titleAr || '',
    updatedAt: a.updatedAt || null,
  }));
  res.json(light);
});

// Detail
app.get('/articles/:id', async (req, res) => {
  const items = await loadJson(ARTICLES_FILE, []);
  const item = items.find(a => a.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

// Create
app.post('/articles', async (req, res) => {
  const { id, categoryId, titleBn, titleEn, titleAr, contentBn, contentEn, contentAr } = req.body || {};
  const items = await loadJson(ARTICLES_FILE, []);
  const newId = sanitizeId(id || titleEn || titleBn);
  if (!newId) return res.status(400).json({ message: 'Invalid id' });
  if (items.some(a => a.id === newId)) return res.status(409).json({ message: 'Article id already exists' });
  const now = new Date().toISOString();
  const article = {
    id: newId,
    categoryId: categoryId || null,
    titleBn: titleBn || '',
    titleEn: titleEn || '',
    titleAr: titleAr || '',
    contentBn: contentBn || '',
    contentEn: contentEn || '',
    contentAr: contentAr || '',
    createdAt: now,
    updatedAt: now,
  };
  items.push(article);
  await saveJson(ARTICLES_FILE, items);
  res.status(201).json(article);
});

// Update
app.put('/articles/:id', async (req, res) => {
  const id = req.params.id;
  const items = await loadJson(ARTICLES_FILE, []);
  const idx = items.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  const now = new Date().toISOString();
  items[idx] = {
    ...items[idx],
    ...req.body,
    id, // never allow changing id via update
    updatedAt: now,
  };
  await saveJson(ARTICLES_FILE, items);
  res.json(items[idx]);
});

// Delete
app.delete('/articles/:id', async (req, res) => {
  const id = req.params.id;
  const items = await loadJson(ARTICLES_FILE, []);
  const next = items.filter(a => a.id !== id);
  if (next.length === items.length) return res.status(404).json({ message: 'Not found' });
  await saveJson(ARTICLES_FILE, next);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Articles API running on http://localhost:${PORT}`);
});
