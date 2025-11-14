import React, { useEffect, useState } from 'react'
import { addCategory, deleteCategory, listCategories, type Category } from '../api'

export default function CategoryManager() {
  const [items, setItems] = useState<Category[]>([])
  const [titleBn, setTitleBn] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [titleAr, setTitleAr] = useState('')
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    const list = await listCategories()
    setItems(list)
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  async function onAdd(e: React.FormEvent) {
    e.preventDefault()
    const created = await addCategory({ titleBn, titleEn, titleAr })
    setItems(prev => [...prev, created])
    setTitleBn(''); setTitleEn(''); setTitleAr('')
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this category?')) return
    await deleteCategory(id)
    setItems(prev => prev.filter(x => x.id !== id))
  }

  return (
    <div className="card">
      <div className="card-header">Categories</div>
      <div className="card-body space-y-4">
        <form onSubmit={onAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="label">Title (BN)</label>
            <input className="input" value={titleBn} onChange={e => setTitleBn(e.target.value)} placeholder="বাংলা শিরোনাম" />
          </div>
          <div>
            <label className="label">Title (EN)</label>
            <input className="input" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="English title" />
          </div>
          <div>
            <label className="label">Title (AR)</label>
            <input className="input" value={titleAr} onChange={e => setTitleAr(e.target.value)} placeholder="العنوان" dir="rtl" />
          </div>
          <div className="flex items-end">
            <button className="btn btn-primary w-full" type="submit">Add</button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">BN</th>
                <th className="py-2 pr-3">EN</th>
                <th className="py-2 pr-3">AR</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-3" colSpan={5}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-3" colSpan={5}>No categories yet</td></tr>
              ) : items.map(cat => (
                <tr key={cat.id} className="border-t">
                  <td className="py-2 pr-3"><span className="badge">{cat.id}</span></td>
                  <td className="py-2 pr-3">{cat.titleBn}</td>
                  <td className="py-2 pr-3">{cat.titleEn}</td>
                  <td className="py-2 pr-3" dir="rtl">{cat.titleAr}</td>
                  <td className="py-2">
                    <button className="btn btn-outline" onClick={() => onDelete(cat.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
