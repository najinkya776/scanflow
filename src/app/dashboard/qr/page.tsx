'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface QRCode {
  id: string
  name: string
  type: string
  tableNumber: string | null
  scans: number
  createdAt: string
}

interface Restaurant {
  id: string
  name: string
  slug: string
}

export default function QRPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'table', tableNumber: '' })
  const [generatedQR, setGeneratedQR] = useState<{ qrDataUrl: string; url: string; id: string } | null>(null)
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
    fetch(`/api/restaurants/${restaurantId}`).then((r) => r.json()).then((data) => {
      setQrCodes(data?.qrCodes ?? [])
      setLoading(false)
    })
  }, [restaurantId])

  async function generateQR() {
    if (!restaurantId || !form.name) return
    setGenerating(true)
    const res = await fetch('/api/qr/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, restaurantId }),
    })
    if (res.ok) {
      const data = await res.json()
      setGeneratedQR({ qrDataUrl: data.qrDataUrl, url: data.url, id: data.qrCode.id })
      setQrCodes((prev) => [data.qrCode, ...prev])
      setForm({ name: '', type: 'table', tableNumber: '' })
      showToast('QR code generated!')
    }
    setGenerating(false)
  }

  async function downloadQR(dataUrl: string, name: string) {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `scanflow-qr-${name.toLowerCase().replace(/\s+/g, '-')}.png`
    link.click()
  }

  async function getQRImage(qrId: string, slug: string) {
    const res = await fetch(`/api/qr/generate?qrId=${qrId}&slug=${slug}`)
    if (res.ok) {
      const data = await res.json()
      setGeneratedQR({ qrDataUrl: data.qrDataUrl, url: data.url, id: qrId })
    }
  }

  const currentRestaurant = restaurants.find((r) => r.id === restaurantId)
  const typeColors: Record<string, string> = {
    table: 'bg-blue-100 text-blue-700',
    bill: 'bg-green-100 text-green-700',
    takeaway: 'bg-amber-100 text-amber-700',
    event: 'bg-purple-100 text-purple-700',
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
          <h1 className="text-2xl font-extrabold text-gray-900">QR Codes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generate and manage your smart QR codes</p>
        </div>
        {restaurants.length > 1 && (
          <select value={restaurantId ?? ''} onChange={(e) => setRestaurantId(e.target.value)} className="input w-auto text-sm">
            {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate Form */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Generate New QR Code</h2>
          <div className="space-y-3">
            <div>
              <label className="label">QR Code Name</label>
              <input
                className="input text-sm"
                placeholder="e.g. Table 5, Main Counter"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                className="input text-sm"
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              >
                <option value="table">Table QR</option>
                <option value="bill">Bill QR</option>
                <option value="takeaway">Takeaway Counter</option>
                <option value="event">Event QR</option>
              </select>
            </div>
            {form.type === 'table' && (
              <div>
                <label className="label">Table Number (optional)</label>
                <input
                  className="input text-sm"
                  placeholder="e.g. 7"
                  value={form.tableNumber}
                  onChange={(e) => setForm((p) => ({ ...p, tableNumber: e.target.value }))}
                />
              </div>
            )}
            <button
              onClick={generateQR}
              disabled={generating || !form.name}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {generating ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Generating...</>
              ) : (
                '📱 Generate QR Code'
              )}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="card flex flex-col items-center justify-center min-h-48">
          {generatedQR ? (
            <div className="text-center">
              <div className="bg-white p-3 rounded-2xl shadow-lg inline-block mb-3">
                <Image src={generatedQR.qrDataUrl} alt="QR Code" width={200} height={200} className="rounded-xl" />
              </div>
              <p className="text-xs text-gray-500 mb-3 break-all px-4">{generatedQR.url}</p>
              <button
                onClick={() => downloadQR(generatedQR.qrDataUrl, 'qr-code')}
                className="btn-primary text-sm py-2"
              >
                ⬇️ Download PNG
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-5xl mb-3">📱</div>
              <p className="text-sm">Generate a QR code to preview it here</p>
            </div>
          )}
        </div>
      </div>

      {/* Existing QR Codes */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Your QR Codes</h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"></div>)}
          </div>
        ) : qrCodes.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No QR codes yet. Generate your first one!</p>
        ) : (
          <div className="space-y-2">
            {qrCodes.map((qr) => (
              <div key={qr.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl flex-shrink-0">
                  {qr.type === 'table' ? '🪑' : qr.type === 'bill' ? '🧾' : qr.type === 'takeaway' ? '📦' : '🎪'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">{qr.name}</span>
                    <span className={`badge text-xs ${typeColors[qr.type] ?? 'bg-gray-100 text-gray-700'} capitalize`}>{qr.type}</span>
                  </div>
                  <div className="text-xs text-gray-400">{qr.scans} scans</div>
                </div>
                {currentRestaurant && (
                  <button
                    onClick={() => getQRImage(qr.id, currentRestaurant.slug)}
                    className="text-brand-600 hover:text-brand-700 text-sm font-semibold hover:underline flex-shrink-0"
                  >
                    View QR
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card bg-amber-50 border-amber-200">
        <h3 className="font-bold text-amber-900 mb-2">📌 Where to place your QR codes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🪑', label: 'Table tops', tip: 'Laminated stand or sticker' },
            { icon: '🧾', label: 'Bill folder', tip: 'Inside the bill slip' },
            { icon: '📦', label: 'Takeaway bag', tip: 'Sticker on bag/box' },
            { icon: '🚪', label: 'Entrance', tip: 'Standee at the door' },
          ].map((p) => (
            <div key={p.label} className="bg-white rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{p.icon}</div>
              <div className="text-xs font-semibold text-amber-900">{p.label}</div>
              <div className="text-xs text-amber-700">{p.tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
