// Dynamic API base: use current host so preview on 192.168.x.x can reach API on same machine
const API_BASE = (() => {
  try {
    const host = window.location.hostname || 'localhost'
    return `http://${host}:8081`
  } catch {
    return 'http://localhost:8081'
  }
})()

export type Category = { id: string; titleBn: string; titleEn: string; titleAr: string }
export type Article = {
  id: string
  categoryId: string | null
  titleBn: string
  titleEn: string
  titleAr: string
  contentBn: string
  contentEn: string
  contentAr: string
  createdAt?: string
  updatedAt?: string
}

export async function listCategories(): Promise<Category[]> {
  const r = await fetch(`${API_BASE}/articles/categories`)
  return r.json()
}

export async function addCategory(input: Partial<Category>): Promise<Category> {
  const r = await fetch(`${API_BASE}/articles/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function deleteCategory(id: string): Promise<void> {
  const r = await fetch(`${API_BASE}/articles/categories/${id}`, { method: 'DELETE' })
  if (!r.ok) throw new Error(await r.text())
}

export async function listArticles(categoryId?: string): Promise<Article[]> {
  const url = new URL(`${API_BASE}/articles`)
  if (categoryId) url.searchParams.set('categoryId', categoryId)
  const r = await fetch(url)
  return r.json()
}

export async function getArticle(id: string): Promise<Article> {
  const r = await fetch(`${API_BASE}/articles/${id}`)
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function createArticle(input: Partial<Article>): Promise<Article> {
  const r = await fetch(`${API_BASE}/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function updateArticle(id: string, input: Partial<Article>): Promise<Article> {
  const r = await fetch(`${API_BASE}/articles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function deleteArticle(id: string): Promise<void> {
  const r = await fetch(`${API_BASE}/articles/${id}`, { method: 'DELETE' })
  if (!r.ok) throw new Error(await r.text())
}
