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
}

interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

interface Offer {
  id: string
  title: string
  description: string | null
}

interface Restaurant {
  id: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  instagram: string | null
  googleReviewUrl: string | null
  googleMapsUrl: string | null
  wifiPassword: string | null
  primaryColor: string
  callWaiterEnabled: boolean
  menuCategories: MenuCategory[]
  offers: Offer[]
}

type ReviewStep = 'landing' | 'rating' | 'positive' | 'negative' | 'done'
type Rating = 'excellent' | 'good' | 'average' | 'bad'

interface Props {
  restaurant: Restaurant
  qrId?: string
  qrType?: string
  tableNumber?: string
}

export default function CustomerPage({ restaurant, qrId, qrType, tableNumber }: Props) {
  const [step, setStep] = useState<ReviewStep>('landing')
  const [rating, setRating] = useState<Rating | null>(null)
  const [aiReview, setAiReview] = useState('')
  const [loadingReview, setLoadingReview] = useState(false)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'menu' | 'offers' | 'info'>('menu')
  const [copiedReview, setCopiedReview] = useState(false)
  const [waiterCalled, setWaiterCalled] = useState<string | null>(null)
  const primaryColor = restaurant.primaryColor || '#22c55e'

  useEffect(() => {
    if (qrId || qrType) {
      fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: restaurant.id, qrCodeId: qrId, qrType: qrType ?? 'menu', tableNumber }),
      })
    }
  }, [restaurant.id, qrId, qrType, tableNumber])

  async function handleRating(r: Rating) {
    setRating(r)
    if (r === 'excellent' || r === 'good') {
      setStep('positive')
      setLoadingReview(true)
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantName: restaurant.name, rating: r }),
      })
      if (res.ok) {
        const data = await res.json()
        setAiReview(data.review)
      }
      setLoadingReview(false)
    } else {
      setStep('negative')
    }
  }

  async function submitNegativeFeedback() {
    setSubmitting(true)
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: restaurant.id,
        rating,
        comment: feedbackComment,
        customerName: customerName || undefined,
        qrCodeId: qrId,
        qrType,
        tableNumber,
        redirectedToGoogle: false,
      }),
    })
    setSubmitting(false)
    setStep('done')
  }

  async function recordGoogleRedirect() {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: restaurant.id,
        rating,
        comment: aiReview,
        qrCodeId: qrId,
        qrType,
        tableNumber,
        redirectedToGoogle: true,
      }),
    })
    if (restaurant.googleReviewUrl) {
      window.open(restaurant.googleReviewUrl, '_blank')
    }
    setStep('done')
  }

  function copyReview() {
    navigator.clipboard.writeText(aiReview)
    setCopiedReview(true)
    setTimeout(() => setCopiedReview(false), 2000)
  }

  const ratingOptions = [
    { value: 'excellent' as Rating, emoji: '😍', label: 'Excellent', color: 'hover:border-green-400 hover:bg-green-50' },
    { value: 'good' as Rating, emoji: '🙂', label: 'Good', color: 'hover:border-blue-400 hover:bg-blue-50' },
    { value: 'average' as Rating, emoji: '😐', label: 'Average', color: 'hover:border-yellow-400 hover:bg-yellow-50' },
    { value: 'bad' as Rating, emoji: '😞', label: 'Bad', color: 'hover:border-red-400 hover:bg-red-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Review Modal Overlay */}
      {step !== 'landing' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">

            {/* Rating Step */}
            {step === 'rating' && (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">⭐</div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-1">How was your experience?</h2>
                <p className="text-gray-500 text-sm mb-6">at {restaurant.name}</p>
                <div className="grid grid-cols-2 gap-3">
                  {ratingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleRating(opt.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-100 transition-all ${opt.color} active:scale-95`}
                    >
                      <span className="text-3xl">{opt.emoji}</span>
                      <span className="font-semibold text-sm text-gray-700">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep('landing')} className="mt-4 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
              </div>
            )}

            {/* Positive Review Step */}
            {step === 'positive' && (
              <div className="p-8">
                <div className="text-center mb-5">
                  <div className="text-4xl mb-2">{rating === 'excellent' ? '😍' : '🙂'}</div>
                  <h2 className="text-xl font-extrabold text-gray-900">We&apos;re so glad you enjoyed it!</h2>
                  <p className="text-gray-500 text-sm mt-1">Help others discover us with a quick review</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-500">✨ AI-suggested review (feel free to edit):</span>
                  </div>
                  {loadingReview ? (
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/5"></div>
                    </div>
                  ) : (
                    <textarea
                      value={aiReview}
                      onChange={(e) => setAiReview(e.target.value)}
                      className="w-full bg-transparent text-gray-700 text-sm resize-none outline-none leading-relaxed"
                      rows={4}
                    />
                  )}
                </div>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={copyReview}
                    disabled={loadingReview}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
                  >
                    {copiedReview ? '✅ Copied!' : '📋 Copy Review'}
                  </button>
                  <button
                    onClick={recordGoogleRedirect}
                    disabled={loadingReview}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-sm transition-all active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    ⭐ Post on Google
                  </button>
                </div>

                <p className="text-center text-xs text-gray-400">
                  Copy the review, then paste it on Google
                </p>
              </div>
            )}

            {/* Negative Feedback Step */}
            {step === 'negative' && (
              <div className="p-8">
                <div className="text-center mb-5">
                  <div className="text-4xl mb-2">😔</div>
                  <h2 className="text-xl font-extrabold text-gray-900">We&apos;re sorry to hear that</h2>
                  <p className="text-gray-500 text-sm mt-1">Your feedback goes directly to our management — not public</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="label text-sm">What can we improve? *</label>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="input text-sm resize-none"
                      rows={4}
                      placeholder="Tell us what went wrong..."
                    />
                  </div>
                  <div>
                    <label className="label text-sm">Your name (optional)</label>
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="input text-sm"
                      placeholder="So we can follow up with you"
                    />
                  </div>
                  <button
                    onClick={submitNegativeFeedback}
                    disabled={submitting || !feedbackComment.trim()}
                    className="w-full py-3 rounded-2xl text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {submitting ? 'Sending...' : 'Send Private Feedback'}
                  </button>
                  <p className="text-center text-xs text-gray-400">
                    🛡️ This goes only to the restaurant owner, never public
                  </p>
                </div>
              </div>
            )}

            {/* Done Step */}
            {step === 'done' && (
              <div className="p-8 text-center">
                {rating === 'excellent' || rating === 'good' ? (
                  <>
                    <div className="text-5xl mb-3">🎉</div>
                    <h2 className="text-xl font-extrabold text-gray-900 mb-2">Thank you!</h2>
                    <p className="text-gray-500">Your review means the world to us. See you next time!</p>
                  </>
                ) : (
                  <>
                    <div className="text-5xl mb-3">💪</div>
                    <h2 className="text-xl font-extrabold text-gray-900 mb-2">We got your feedback!</h2>
                    <p className="text-gray-500">We&apos;ll make it right. Thank you for helping us improve.</p>
                  </>
                )}
                <button
                  onClick={() => setStep('landing')}
                  className="mt-6 py-3 px-6 rounded-2xl text-white font-bold text-sm transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  Back to Menu
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Restaurant Header */}
      <div className="text-white pt-safe" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)` }}>
        <div className="max-w-lg mx-auto px-4 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
              {restaurant.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{restaurant.name}</h1>
              {tableNumber && (
                <div className="text-white/80 text-sm font-medium">Table {tableNumber}</div>
              )}
            </div>
          </div>
          {restaurant.description && (
            <p className="text-white/80 text-sm leading-relaxed">{restaurant.description}</p>
          )}
          {restaurant.address && (
            <div className="flex items-center gap-1.5 mt-2 text-white/70 text-xs">
              <span>📍</span> {restaurant.address}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 -mt-4">

        {/* Review CTA Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex items-center justify-between border border-gray-100">
          <div>
            <div className="font-bold text-gray-900 text-sm">Enjoyed your visit?</div>
            <div className="text-xs text-gray-500">Help others with a quick review</div>
          </div>
          <button
            onClick={() => setStep('rating')}
            className="px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all active:scale-95 flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            ⭐ Rate Us
          </button>
        </div>

        {/* Offers */}
        {restaurant.offers.length > 0 && (
          <div className="mb-4 space-y-2">
            {restaurant.offers.map((offer) => (
              <div key={offer.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-3">
                <span className="text-xl">🎁</span>
                <div>
                  <div className="font-bold text-amber-900 text-sm">{offer.title}</div>
                  {offer.description && <div className="text-amber-700 text-xs">{offer.description}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-4">
          {(['menu', 'offers', 'info'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              {tab === 'menu' ? '🍽️ Menu' : tab === 'offers' ? '🎁 Offers' : 'ℹ️ Info'}
            </button>
          ))}
        </div>

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-4 pb-24">
            {restaurant.menuCategories.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <div className="text-4xl mb-2">🍽️</div>
                <p className="text-sm">Menu coming soon!</p>
              </div>
            ) : (
              restaurant.menuCategories.map((cat) => (
                <div key={cat.id}>
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{cat.name}</h2>
                  <div className="space-y-2">
                    {cat.items.map((item) => (
                      <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`w-3 h-3 rounded border-2 flex-shrink-0 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                                <span className={`block w-1.5 h-1.5 rounded m-auto mt-0.5 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              </span>
                              <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                              {item.isBestSeller && (
                                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">Best</span>
                              )}
                              {item.isSpicy && <span className="text-sm">🌶️</span>}
                            </div>
                            {item.description && (
                              <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                          <span className="font-extrabold text-sm flex-shrink-0" style={{ color: primaryColor }}>
                            ₹{item.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="space-y-3 pb-24">
            {restaurant.offers.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <div className="text-4xl mb-2">🎁</div>
                <p className="text-sm">No active offers right now</p>
              </div>
            ) : (
              restaurant.offers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="text-2xl mb-2">🎁</div>
                  <h3 className="font-bold text-gray-900 mb-1">{offer.title}</h3>
                  {offer.description && <p className="text-sm text-gray-500">{offer.description}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-3 pb-24">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
              {restaurant.phone && (
                <a href={`tel:${restaurant.phone}`} className="flex items-center gap-3 text-sm">
                  <span className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center text-base">📞</span>
                  <span className="text-gray-700 font-medium">{restaurant.phone}</span>
                </a>
              )}
              {restaurant.googleMapsUrl && (
                <a href={restaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm">
                  <span className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center text-base">📍</span>
                  <span className="text-gray-700 font-medium">View on Google Maps</span>
                </a>
              )}
              {restaurant.instagram && (
                <a href={`https://instagram.com/${restaurant.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm">
                  <span className="w-8 h-8 bg-pink-100 rounded-xl flex items-center justify-center text-base">📸</span>
                  <span className="text-gray-700 font-medium">@{restaurant.instagram}</span>
                </a>
              )}
              {restaurant.wifiPassword && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-base">📶</span>
                  <div>
                    <div className="text-xs text-gray-400">WiFi Password</div>
                    <div className="text-gray-700 font-medium font-mono">{restaurant.wifiPassword}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Waiter Call Buttons */}
      {restaurant.callWaiterEnabled && tableNumber && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
          <div className="max-w-lg mx-auto">
            {waiterCalled ? (
              <div className="text-center py-2 text-brand-600 font-semibold text-sm">
                ✅ {waiterCalled} — Your waiter has been notified!
              </div>
            ) : (
              <div>
                <div className="text-xs text-gray-400 text-center mb-2">Call waiter</div>
                <div className="flex gap-2">
                  {['Need Assistance', 'Need Bill', 'Need Water'].map((action) => (
                    <button
                      key={action}
                      onClick={() => setWaiterCalled(action)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
                    >
                      {action === 'Need Assistance' ? '🙋' : action === 'Need Bill' ? '💳' : '💧'} {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Powered by */}
      <div className="text-center py-4 pb-8 text-xs text-gray-300">
        Powered by{' '}
        <a href="/" className="text-gray-400 hover:text-gray-600 font-semibold">ScanFlow</a>
      </div>
    </div>
  )
}
