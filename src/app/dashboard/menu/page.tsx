'use client'

import { useEffect, useState } from 'react'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  isVeg: boolean
  isSpicy: boolean
  isBestSeller: boolean
  isAvailable: boolean
}

interface Category {
  id: string
  name: string
  items: MenuItem[]
}

export default function MenuPage() {
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string }>>([])
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState('')
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', isVeg: true, isSpicy: false, isBestSeller: false })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch('/api/restaurants').then((r) => r.json()).then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setRestaurants(data)
        setRestaurantId(data[0].id)
      } else {
        setLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    if (!restaurantId) return
    setLoading(true)
    fetch(`/api/menu?restaurantId=${restaurantId}`)
      .then((r) => r.json())
      .then((data) => { setCategories(Array.isArray(data) ? data : []); setLoading(false) })
  }, [restaurantId])

  async function addCategory() {
    if (!newCategory.trim() || !restaurantId) return
    setSaving(true)
    const res = await fetch('/api/menu?type=category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategory, restaurantId }),
    })
    if (res.ok) {
      const cat = await res.json()
      setCategories((prev) => [...prev, { ...cat, items: [] }])
      setNewCategory('')
      setShowCategoryForm(false)
      showToast('Category added!')
    }
    setSaving(false)
  }

  async function addItem(categoryId: string) {
    if (!newItem.name.trim() || !newItem.price || !restaurantId) return
    setSaving(true)
    const res = await fetch('/api/menu?type=item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newItem, price: parseFloat(newItem.price), categoryId, restaurantId }),
    })
    if (res.ok) {
      const item = await res.json()
      setCategories((prev) => prev.map((c) => c.id === categoryId ? { ...c, items: [...c.items, item] } : c))
      setNewItem({ name: '', description: '', price: '', isVeg: true, isSpicy: false, isBestSeller: false })
      setShowItemForm(null)
      showToast('Item added!')
    }
    setSaving(false)
  }

  async function toggleItem(itemId: string, field: string, value: boolean) {
    await fetch(`/api/menu/${itemId}?type=item`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    setCategories((prev) => prev.map((c) => ({
      ...c,
      items: c.items.map((i) => i.id === itemId ? { ...i, [field]: value } : i),
    })))
  }

  async function deleteItem(itemId: string, categoryId: string) {
    if (!confirm('Delete this item?')) return
    await fetch(`/api/menu/${itemId}?type=item`, { method: 'DELETE' })
    setCategories((prev) => prev.map((c) => c.id === categoryId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c))
    showToast('Item deleted')
  }

  async function deleteCategory(catId: string) {
    if (!confirm('Delete this category and all its items?')) return
    await fetch(`/api/menu/${catId}?type=category`, { method: 'DELETE' })
    setCategories((prev) => prev.filter((c) => c.id !== catId))
    showToast('Category deleted')
  }

  if (!restaurantId && !loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="text-gray-500">Create a restaurant first in Settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-brand-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold animate-slide-up">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Menu Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your restaurant menu</p>
        </div>
        {restaurants.length > 1 && (
          <select value={restaurantId ?? ''} onChange={(e) => setRestaurantId(e.target.value)} className="input w-auto text-sm">
            {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="card animate-pulse h-32"></div>)}
        </div>
      ) : (
        <>
          {categories.map((cat) => (
            <div key={cat.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">{cat.name}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowItemForm(showItemForm === cat.id ? null : cat.id)}
                    className="btn-primary text-sm py-1.5 px-4"
                  >
                    + Add Item
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {showItemForm === cat.id && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                  <h3 className="font-semibold text-sm text-gray-700">Add New Item</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <input
                        className="input text-sm"
                        placeholder="Item name *"
                        value={newItem.name}
                        onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        className="input text-sm"
                        placeholder="Description (optional)"
                        value={newItem.description}
                        onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="Price (₹) *"
                      value={newItem.price}
                      onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
                    />
                    <div className="flex gap-4 items-center text-sm">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={newItem.isVeg} onChange={(e) => setNewItem((p) => ({ ...p, isVeg: e.target.checked }))} className="rounded" />
                        <span className="text-green-600">🌿 Veg</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={newItem.isSpicy} onChange={(e) => setNewItem((p) => ({ ...p, isSpicy: e.target.checked }))} className="rounded" />
                        <span>🌶️ Spicy</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={newItem.isBestSeller} onChange={(e) => setNewItem((p) => ({ ...p, isBestSeller: e.target.checked }))} className="rounded" />
                        <span>⭐ Best</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addItem(cat.id)} disabled={saving} className="btn-primary text-sm py-1.5 px-4">
                      {saving ? 'Saving...' : 'Save Item'}
                    </button>
                    <button onClick={() => setShowItemForm(null)} className="btn-secondary text-sm py-1.5 px-4">Cancel</button>
                  </div>
                </div>
              )}

              {cat.items.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No items yet. Add your first item!</p>
              ) : (
                <div className="space-y-2">
                  {cat.items.map((item) => (
                    <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.isAvailable ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-gray-900">{item.name}</span>
                          {item.isBestSeller && <span className="badge bg-amber-100 text-amber-700">⭐ Best</span>}
                          {item.isSpicy && <span className="text-sm">🌶️</span>}
                        </div>
                        {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
                      </div>
                      <span className="font-bold text-brand-600 text-sm flex-shrink-0">₹{item.price}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => toggleItem(item.id, 'isAvailable', !item.isAvailable)}
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors ${item.isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                          {item.isAvailable ? 'Available' : 'Off'}
                        </button>
                        <button onClick={() => deleteItem(item.id, cat.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition-colors">
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {showCategoryForm ? (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">New Category</h3>
              <div className="flex gap-2">
                <input
                  className="input text-sm flex-1"
                  placeholder="Category name (e.g. Starters, Desserts)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                  autoFocus
                />
                <button onClick={addCategory} disabled={saving} className="btn-primary text-sm py-2 px-4">
                  {saving ? 'Saving...' : 'Add'}
                </button>
                <button onClick={() => setShowCategoryForm(false)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowCategoryForm(true)} className="card w-full text-center text-brand-600 font-semibold hover:bg-brand-50 border-dashed border-2 border-brand-200 transition-colors py-6">
              + Add Menu Category
            </button>
          )}
        </>
      )}
    </div>
  )
}
