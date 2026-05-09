'use client'

import { useEffect, useState } from 'react'
import { formatRelativeTime, getSentimentEmoji, getRatingColor } from '@/lib/utils'

interface Feedback {
  id: string
  rating: string
  sentiment: string
  comment: string | null
  customerName: string | null
  redirectedToGoogle: boolean
  qrType: string | null
  tableNumber: string | null
  createdAt: string
}

export default function FeedbackPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string }>>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all')
  const [loading, setLoading] = useState(true)
  const [generatingReply, setGeneratingReply] = useState<string | null>(null)
  const [replies, setReplies] = useState<Record<string, string>>({})
  const [restaurantName, setRestaurantName] = useState('')

  useEffect(() => {
    fetch('/api/restaurants').then((r) => r.json()).then((d) => {
      if (Array.isArray(d) && d.length > 0) {
        setRestaurants(d)
        setRestaurantId(d[0].id)
        setRestaurantName(d[0].name)
      } else setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!restaurantId) return
    setLoading(true)
    fetch(`/api/feedback?restaurantId=${restaurantId}`)
      .then((r) => r.json())
      .then((d) => { setFeedback(Array.isArray(d) ? d : []); setLoading(false) })
  }, [restaurantId])

  async function generateReply(feedbackItem: Feedback) {
    setGeneratingReply(feedbackItem.id)
    const res = await fetch('/api/ai/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantName,
        reviewText: feedbackItem.comment ?? `${feedbackItem.rating} experience`,
        rating: feedbackItem.rating,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setReplies((prev) => ({ ...prev, [feedbackItem.id]: data.reply }))
    }
    setGeneratingReply(null)
  }

  const filtered = feedback.filter((f) => {
    if (filter === 'positive') return f.sentiment === 'positive'
    if (filter === 'negative') return f.sentiment === 'negative'
    return true
  })

  const posCount = feedback.filter((f) => f.sentiment === 'positive').length
  const negCount = feedback.filter((f) => f.sentiment === 'negative').length
  const googleCount = feedback.filter((f) => f.redirectedToGoogle).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Customer Feedback</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage reviews and private feedback</p>
        </div>
        {restaurants.length > 1 && (
          <select
            value={restaurantId ?? ''}
            onChange={(e) => {
              const r = restaurants.find((x) => x.id === e.target.value)
              setRestaurantId(e.target.value)
              setRestaurantName(r?.name ?? '')
            }}
            className="input w-auto text-sm"
          >
            {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-extrabold text-brand-600">{posCount}</div>
          <div className="text-xs text-gray-500">Positive</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-extrabold text-red-500">{negCount}</div>
          <div className="text-xs text-gray-500">Negative</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-extrabold text-amber-500">{googleCount}</div>
          <div className="text-xs text-gray-500">Sent to Google</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'positive', 'negative'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all capitalize ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? `All (${feedback.length})` : f === 'positive' ? `Positive (${posCount})` : `Negative (${negCount})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-24"></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-400 text-sm">No feedback yet. Share your QR codes to start collecting!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <div key={f.id} className={`card border-l-4 ${f.sentiment === 'positive' ? 'border-l-green-400' : 'border-l-red-400'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{getSentimentEmoji(f.rating)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`badge capitalize ${getRatingColor(f.rating)}`}>{f.rating}</span>
                    {f.redirectedToGoogle && <span className="badge bg-green-100 text-green-700">✅ Google Review</span>}
                    {!f.redirectedToGoogle && f.sentiment === 'negative' && <span className="badge bg-red-100 text-red-700">🛡️ Captured Privately</span>}
                    {f.qrType && <span className="badge bg-gray-100 text-gray-600 capitalize">{f.qrType}{f.tableNumber ? ` #${f.tableNumber}` : ''}</span>}
                    <span className="text-xs text-gray-400 ml-auto">{formatRelativeTime(f.createdAt)}</span>
                  </div>
                  {f.customerName && <div className="text-xs text-gray-500 mb-1 font-medium">— {f.customerName}</div>}
                  {f.comment && <p className="text-sm text-gray-700 leading-relaxed">{f.comment}</p>}
                  {!f.comment && <p className="text-sm text-gray-400 italic">No comment provided</p>}

                  {/* AI Reply */}
                  {replies[f.id] ? (
                    <div className="mt-3 bg-brand-50 border border-brand-200 rounded-xl p-3">
                      <div className="text-xs text-brand-700 font-semibold mb-1">🤖 AI Reply Suggestion:</div>
                      <p className="text-sm text-gray-700">{replies[f.id]}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(replies[f.id]!)}
                        className="text-xs text-brand-600 font-semibold mt-2 hover:underline"
                      >
                        Copy Reply
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => generateReply(f)}
                      disabled={generatingReply === f.id}
                      className="mt-2 text-xs text-brand-600 font-semibold hover:underline disabled:opacity-50"
                    >
                      {generatingReply === f.id ? '🤖 Generating...' : '🤖 Generate AI Reply'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
