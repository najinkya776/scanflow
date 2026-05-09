'use client'

import { useEffect, useState } from 'react'

interface Restaurant {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  googleReviewUrl: string | null
  googleMapsUrl: string | null
  instagram: string | null
  wifiPassword: string | null
  primaryColor: string
}

export default function SettingsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Restaurant>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', description: '', address: '', phone: '', googleReviewUrl: '' })
  const [creating, setCreating] = useState(false)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch('/api/restaurants').then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) {
        setRestaurants(d)
        if (d.length > 0) {
          setSelectedId(d[0].id)
          setForm(d[0])
        }
      }
    })
  }, [])

  function update(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function save() {
    if (!selectedId) return
    setSaving(true)
    const res = await fetch(`/api/restaurants/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      showToast('Settings saved!')
      const updated = await res.json()
      setRestaurants((prev) => prev.map((r) => r.id === selectedId ? { ...r, ...updated } : r))
    } else {
      showToast('Failed to save', 'error')
    }
    setSaving(false)
  }

  async function createRestaurant() {
    if (!newForm.name) return
    setCreating(true)
    const res = await fetch('/api/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newForm),
    })
    if (res.ok) {
      const created = await res.json()
      setRestaurants((prev) => [...prev, created])
      setSelectedId(created.id)
      setForm(created)
      setShowNewForm(false)
      setNewForm({ name: '', description: '', address: '', phone: '', googleReviewUrl: '' })
      showToast('Restaurant created!')
    } else {
      showToast('Failed to create', 'error')
    }
    setCreating(false)
  }

  const fields = [
    { key: 'name', label: 'Restaurant Name', placeholder: 'Spice Garden', required: true },
    { key: 'description', label: 'Description', placeholder: 'Authentic North Indian cuisine...', multiline: true },
    { key: 'address', label: 'Address', placeholder: '42 MG Road, Bangalore - 560001' },
    { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
    { key: 'email', label: 'Contact Email', placeholder: 'hello@restaurant.com' },
    { key: 'googleReviewUrl', label: 'Google Review URL', placeholder: 'https://g.page/r/your-review-link', hint: 'Where customers get redirected to post reviews' },
    { key: 'googleMapsUrl', label: 'Google Maps URL', placeholder: 'https://maps.google.com/...' },
    { key: 'instagram', label: 'Instagram Handle', placeholder: 'yourrestaurant (without @)' },
    { key: 'wifiPassword', label: 'WiFi Password', placeholder: 'For customers to see on the QR page' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold animate-slide-up ${toast.type === 'success' ? 'bg-brand-600 text-white' : 'bg-red-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your restaurant profile</p>
        </div>
        <button onClick={() => setShowNewForm(!showNewForm)} className="btn-secondary text-sm py-2">
          + Add Restaurant
        </button>
      </div>

      {/* Add restaurant form */}
      {showNewForm && (
        <div className="card border-2 border-brand-200">
          <h2 className="font-bold text-gray-900 mb-4">Create New Restaurant</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Restaurant Name *</label>
              <input className="input text-sm" placeholder="My Restaurant" value={newForm.name} onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input text-sm resize-none" rows={2} placeholder="Brief description..." value={newForm.description} onChange={(e) => setNewForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="label">Google Review URL</label>
              <input className="input text-sm" placeholder="https://g.page/r/..." value={newForm.googleReviewUrl} onChange={(e) => setNewForm((p) => ({ ...p, googleReviewUrl: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <button onClick={createRestaurant} disabled={creating || !newForm.name} className="btn-primary text-sm py-2">
                {creating ? 'Creating...' : 'Create Restaurant'}
              </button>
              <button onClick={() => setShowNewForm(false)} className="btn-secondary text-sm py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {restaurants.length > 1 && (
        <div>
          <label className="label">Select Restaurant</label>
          <select
            value={selectedId ?? ''}
            onChange={(e) => {
              const r = restaurants.find((x) => x.id === e.target.value)
              setSelectedId(e.target.value)
              if (r) setForm(r)
            }}
            className="input text-sm"
          >
            {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      )}

      {selectedId && (
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900">Restaurant Profile</h2>

          {fields.map((field) => (
            <div key={field.key}>
              <label className="label">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              {field.multiline ? (
                <textarea
                  className="input text-sm resize-none"
                  rows={2}
                  placeholder={field.placeholder}
                  value={(form as Record<string, string>)[field.key] ?? ''}
                  onChange={(e) => update(field.key, e.target.value)}
                />
              ) : (
                <input
                  className="input text-sm"
                  placeholder={field.placeholder}
                  value={(form as Record<string, string>)[field.key] ?? ''}
                  onChange={(e) => update(field.key, e.target.value)}
                />
              )}
              {field.hint && <p className="text-xs text-gray-400 mt-1">{field.hint}</p>}
            </div>
          ))}

          <div>
            <label className="label">Brand Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor ?? '#22c55e'}
                onChange={(e) => update('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <span className="text-sm text-gray-500">{form.primaryColor}</span>
            </div>
          </div>

          {form.slug && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-1">Your customer page URL:</div>
              <code className="text-brand-600 text-sm">http://localhost:3000/r/{form.slug}</code>
            </div>
          )}

          <button onClick={save} disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}

      {restaurants.length === 0 && !showNewForm && (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🏪</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Restaurant Yet</h2>
          <p className="text-gray-500 mb-6 text-sm">Create your first restaurant to start collecting QR reviews.</p>
          <button onClick={() => setShowNewForm(true)} className="btn-primary">Create Restaurant</button>
        </div>
      )}
    </div>
  )
}
