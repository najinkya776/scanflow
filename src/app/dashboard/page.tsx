'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatRelativeTime, getSentimentEmoji, getRatingColor } from '@/lib/utils'

interface Stats {
  totalScans: number
  totalFeedback: number
  googleRedirects: number
  reviewConversionRate: number
  sentimentScore: number
  positiveFeedback: number
  negativeFeedback: number
}

interface Feedback {
  id: string
  rating: string
  sentiment: string
  comment: string | null
  redirectedToGoogle: boolean
  createdAt: string
}

const DEMO_RESTAURANT_ID = 'demo'

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/restaurants')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRestaurants(data)
          setSelectedRestaurant(data[0].id)
        }
      })
  }, [])

  useEffect(() => {
    if (!selectedRestaurant) return
    setLoading(true)
    Promise.all([
      fetch(`/api/analytics?restaurantId=${selectedRestaurant}`).then((r) => r.json()),
      fetch(`/api/feedback?restaurantId=${selectedRestaurant}`).then((r) => r.json()),
    ]).then(([analyticsData, feedbackData]) => {
      setStats(analyticsData.summary)
      setFeedback(Array.isArray(feedbackData) ? feedbackData.slice(0, 5) : [])
      setLoading(false)
    })
  }, [selectedRestaurant])

  const statCards = stats
    ? [
        { label: 'Total QR Scans', value: stats.totalScans, icon: '📱', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Feedback', value: stats.totalFeedback, icon: '💬', color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Google Redirects', value: stats.googleRedirects, icon: '⭐', color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Review Rate', value: `${stats.reviewConversionRate}%`, icon: '🎯', color: 'text-brand-600', bg: 'bg-brand-50' },
        { label: 'Happy Customers', value: `${stats.sentimentScore}%`, icon: '😍', color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Needs Attention', value: stats.negativeFeedback, icon: '⚠️', color: 'text-red-600', bg: 'bg-red-50' },
      ]
    : []

  const currentRestaurant = restaurants.find((r) => r.id === selectedRestaurant)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Your restaurant performance at a glance</p>
        </div>
        {restaurants.length > 0 && (
          <select
            value={selectedRestaurant ?? ''}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="input w-auto text-sm"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        )}
      </div>

      {restaurants.length === 0 && !loading && (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🏪</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Set Up Your Restaurant</h2>
          <p className="text-gray-500 mb-6">Create your restaurant profile to start collecting reviews with QR codes.</p>
          <Link href="/dashboard/settings" className="btn-primary">Create Restaurant</Link>
        </div>
      )}

      {loading && selectedRestaurant && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-gray-100"></div>
          ))}
        </div>
      )}

      {!loading && stats && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="card">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <span className="text-xl">{card.icon}</span>
                </div>
                <div className={`text-2xl font-extrabold ${card.color}`}>{card.value}</div>
                <div className="text-gray-500 text-xs mt-0.5">{card.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/dashboard/qr" className="card hover:shadow-md transition-shadow flex items-center gap-3 group">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
                <span className="text-xl">📱</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Generate QR Code</div>
                <div className="text-xs text-gray-500">For tables, bills, takeaway</div>
              </div>
            </Link>
            <Link href="/dashboard/menu" className="card hover:shadow-md transition-shadow flex items-center gap-3 group">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                <span className="text-xl">🍽️</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Update Menu</div>
                <div className="text-xs text-gray-500">Add or edit items</div>
              </div>
            </Link>
            <Link href="/dashboard/ai" className="card hover:shadow-md transition-shadow flex items-center gap-3 group">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">AI Tools</div>
                <div className="text-xs text-gray-500">Generate content & insights</div>
              </div>
            </Link>
          </div>

          {/* Recent Feedback */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Recent Feedback</h2>
              <Link href="/dashboard/feedback" className="text-sm text-brand-600 font-semibold hover:underline">View all</Link>
            </div>
            {feedback.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm">No feedback yet. Share your QR code to start collecting reviews!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {feedback.map((f) => (
                  <div key={f.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-xl mt-0.5">{getSentimentEmoji(f.rating)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`badge ${getRatingColor(f.rating)} capitalize`}>{f.rating}</span>
                        {f.redirectedToGoogle && (
                          <span className="badge bg-green-100 text-green-700">→ Google</span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">{formatRelativeTime(f.createdAt)}</span>
                      </div>
                      {f.comment && <p className="text-sm text-gray-600 truncate">{f.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {currentRestaurant && (
            <div className="card bg-gradient-to-r from-brand-50 to-emerald-50 border-brand-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Your Customer Page is Live!</h3>
                  <p className="text-sm text-gray-600">Share this link or use QR codes</p>
                  <code className="text-brand-600 text-sm font-mono mt-1 block">
                    {process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/r/{currentRestaurant.slug}
                  </code>
                </div>
                <Link
                  href={`/r/${currentRestaurant.slug}`}
                  target="_blank"
                  className="btn-primary flex-shrink-0"
                >
                  Preview ↗
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
