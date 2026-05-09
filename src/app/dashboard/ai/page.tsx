'use client'

import { useEffect, useState } from 'react'

interface Insights {
  summary: string
  topIssues: string[]
  topPraises: string[]
  recommendation: string
}

export default function AIToolsPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string }>>([])
  const [restaurantName, setRestaurantName] = useState('')
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [marketingContent, setMarketingContent] = useState('')
  const [marketingType, setMarketingType] = useState<'instagram' | 'whatsapp' | 'offer'>('instagram')
  const [marketingContext, setMarketingContext] = useState('')
  const [loadingMarketing, setLoadingMarketing] = useState(false)
  const [reviewPreview, setReviewPreview] = useState('')
  const [loadingReview, setLoadingReview] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/restaurants').then((r) => r.json()).then((d) => {
      if (Array.isArray(d) && d.length > 0) {
        setRestaurants(d)
        setRestaurantId(d[0].id)
        setRestaurantName(d[0].name)
      }
    })
  }, [])

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  async function analyzeInsights() {
    if (!restaurantId) return
    setLoadingInsights(true)
    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId }),
    })
    if (res.ok) setInsights(await res.json())
    setLoadingInsights(false)
  }

  async function generateMarketing() {
    if (!restaurantName) return
    setLoadingMarketing(true)
    const res = await fetch('/api/ai/marketing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantName, type: marketingType, context: marketingContext }),
    })
    if (res.ok) {
      const data = await res.json()
      setMarketingContent(data.content)
    }
    setLoadingMarketing(false)
  }

  async function previewReview() {
    if (!restaurantName) return
    setLoadingReview(true)
    const res = await fetch('/api/ai/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantName, rating: 'excellent' }),
    })
    if (res.ok) {
      const data = await res.json()
      setReviewPreview(data.review)
    }
    setLoadingReview(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">AI Tools</h1>
          <p className="text-sm text-gray-500 mt-0.5">Powered by Claude AI</p>
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

      {/* Feedback Insights */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900">📊 AI Feedback Insights</h2>
            <p className="text-sm text-gray-500 mt-0.5">Analyze all customer feedback with AI</p>
          </div>
          <button onClick={analyzeInsights} disabled={loadingInsights} className="btn-primary text-sm py-2">
            {loadingInsights ? '🤖 Analyzing...' : '🤖 Analyze Feedback'}
          </button>
        </div>

        {insights ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs font-semibold text-gray-500 mb-1">SUMMARY</div>
              <p className="text-sm text-gray-700">{insights.summary}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-red-600 mb-2">TOP ISSUES</div>
                <ul className="space-y-1">
                  {insights.topIssues.map((issue, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-1.5">
                      <span className="mt-0.5">⚠️</span>{issue}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-green-600 mb-2">TOP PRAISES</div>
                <ul className="space-y-1">
                  {insights.topPraises.map((praise, i) => (
                    <li key={i} className="text-sm text-green-700 flex items-start gap-1.5">
                      <span className="mt-0.5">✅</span>{praise}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-brand-600 mb-1">RECOMMENDATION</div>
              <p className="text-sm text-brand-800">💡 {insights.recommendation}</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-6 text-sm">Click "Analyze Feedback" to get AI insights</div>
        )}
      </div>

      {/* Review Preview */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900">⭐ AI Review Preview</h2>
            <p className="text-sm text-gray-500 mt-0.5">See how AI generates review suggestions for your customers</p>
          </div>
          <button onClick={previewReview} disabled={loadingReview} className="btn-primary text-sm py-2">
            {loadingReview ? '🤖 Generating...' : 'Generate Sample'}
          </button>
        </div>

        {reviewPreview ? (
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-brand-600 mb-2">SAMPLE REVIEW FOR YOUR CUSTOMERS:</div>
            <p className="text-sm text-gray-700 italic">"{reviewPreview}"</p>
            <button
              onClick={() => copy(reviewPreview, 'review')}
              className="text-xs text-brand-600 font-semibold mt-2 hover:underline"
            >
              {copied === 'review' ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-4">This is what customers see when they rate "Excellent"</p>
        )}
      </div>

      {/* Marketing Generator */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-1">📣 Marketing Content Generator</h2>
        <p className="text-sm text-gray-500 mb-4">Generate Instagram captions, WhatsApp messages, and promotional content</p>

        <div className="space-y-3">
          <div className="flex gap-2">
            {(['instagram', 'whatsapp', 'offer'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMarketingType(t)}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                  marketingType === t ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t === 'instagram' ? '📸 Instagram' : t === 'whatsapp' ? '💬 WhatsApp' : '🎁 Offer'}
              </button>
            ))}
          </div>
          <textarea
            className="input text-sm resize-none"
            rows={2}
            placeholder="Optional: Add context (e.g., 'Weekend special', 'Diwali offer', 'New dish launch')"
            value={marketingContext}
            onChange={(e) => setMarketingContext(e.target.value)}
          />
          <button onClick={generateMarketing} disabled={loadingMarketing} className="btn-primary text-sm py-2">
            {loadingMarketing ? '🤖 Generating...' : '🤖 Generate Content'}
          </button>

          {marketingContent && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-500">GENERATED CONTENT:</div>
                <button
                  onClick={() => copy(marketingContent, 'marketing')}
                  className="text-xs text-brand-600 font-semibold hover:underline"
                >
                  {copied === 'marketing' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{marketingContent}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
