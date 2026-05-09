'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'

interface AnalyticsData {
  summary: {
    totalScans: number
    totalFeedback: number
    positiveFeedback: number
    negativeFeedback: number
    googleRedirects: number
    reviewConversionRate: number
    sentimentScore: number
  }
  chartData: Array<{ date: string; scans: number; feedback: number }>
  ratingDistribution: Array<{ name: string; value: number; color: string }>
}

export default function AnalyticsPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string }>>([])
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/restaurants').then((r) => r.json()).then((d) => {
      if (Array.isArray(d) && d.length > 0) {
        setRestaurants(d)
        setRestaurantId(d[0].id)
      } else setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!restaurantId) return
    setLoading(true)
    fetch(`/api/analytics?restaurantId=${restaurantId}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
  }, [restaurantId])

  const kpis = data
    ? [
        { label: 'Total Scans', value: data.summary.totalScans, icon: '📱', desc: 'All time QR scans' },
        { label: 'Total Feedback', value: data.summary.totalFeedback, icon: '💬', desc: 'Customer responses' },
        { label: 'Google Redirects', value: data.summary.googleRedirects, icon: '⭐', desc: 'Sent to Google review' },
        { label: 'Review Rate', value: `${data.summary.reviewConversionRate}%`, icon: '🎯', desc: 'Of happy customers' },
        { label: 'Positive Sentiment', value: `${data.summary.sentimentScore}%`, icon: '😍', desc: 'Customer satisfaction' },
        { label: 'Negative Feedback', value: data.summary.negativeFeedback, icon: '⚠️', desc: 'Captured privately' },
      ]
    : []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your restaurant performance</p>
        </div>
        {restaurants.length > 1 && (
          <select value={restaurantId ?? ''} onChange={(e) => setRestaurantId(e.target.value)} className="input w-auto text-sm">
            {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card animate-pulse h-24"></div>)}
        </div>
      ) : !data ? (
        <div className="card text-center py-12 text-gray-400">No data available</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="card">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{kpi.icon}</span>
                  <span className="text-3xl font-extrabold text-gray-900">{kpi.value}</span>
                </div>
                <div className="font-semibold text-gray-800 text-sm">{kpi.label}</div>
                <div className="text-xs text-gray-400">{kpi.desc}</div>
              </div>
            ))}
          </div>

          {/* Scan Activity Chart */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">Last 7 Days Activity</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="scans" name="QR Scans" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="feedback" name="Feedback" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">Rating Distribution</h2>
              {data.ratingDistribution.every((d) => d.value === 0) ? (
                <div className="text-center text-gray-400 py-8 text-sm">No ratings yet</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={data.ratingDistribution.filter((d) => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {data.ratingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {data.ratingDistribution.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                        <span className="text-gray-600">{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Review Funnel */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">Review Funnel</h2>
              <div className="space-y-4">
                {[
                  { label: 'QR Scans', value: data.summary.totalScans, color: 'bg-blue-500', width: '100%' },
                  { label: 'Left Feedback', value: data.summary.totalFeedback, color: 'bg-purple-500', width: data.summary.totalScans > 0 ? `${Math.min(100, (data.summary.totalFeedback / data.summary.totalScans) * 100)}%` : '0%' },
                  { label: 'Positive Reviews', value: data.summary.positiveFeedback, color: 'bg-brand-500', width: data.summary.totalFeedback > 0 ? `${Math.min(100, (data.summary.positiveFeedback / data.summary.totalFeedback) * 100)}%` : '0%' },
                  { label: 'Google Redirects', value: data.summary.googleRedirects, color: 'bg-amber-500', width: data.summary.positiveFeedback > 0 ? `${Math.min(100, (data.summary.googleRedirects / data.summary.positiveFeedback) * 100)}%` : '0%' },
                ].map((step) => (
                  <div key={step.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{step.label}</span>
                      <span className="font-bold text-gray-900">{step.value}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${step.color} rounded-full transition-all`} style={{ width: step.width }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
