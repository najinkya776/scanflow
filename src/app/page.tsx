import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-emerald-400 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">ScanFlow</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-brand-600 transition-colors">How It Works</a>
              <a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition-colors">Log in</Link>
              <Link href="/signup" className="btn-primary text-sm py-2 px-5">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-brand-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-sm font-semibold px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
            Trusted by 500+ Restaurants across India
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
            Turn Every QR Scan Into a{' '}
            <span className="text-gradient">5-Star Review</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Smart QR menus that automatically boost your Google reviews, capture negative feedback privately, and grow your restaurant reputation — all in one scan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup" className="btn-primary text-base py-3.5 px-8 text-lg">
              Get Started Free — No Card Needed
            </Link>
            <Link href="/r/spice-garden" target="_blank" className="btn-secondary text-base py-3.5 px-8 text-lg">
              See Live Demo ↗
            </Link>
          </div>

          {/* Hero card mockup */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-brand-200 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-emerald-200 rounded-full blur-3xl opacity-30"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'QR Scans', value: '12,847', icon: '📱', trend: '+34%' },
                  { label: 'Google Reviews', value: '3,291', icon: '⭐', trend: '+67%' },
                  { label: 'Review Rate', value: '78%', icon: '🎯', trend: '+23%' },
                  { label: 'Avg Rating', value: '4.8★', icon: '🏆', trend: '+0.4' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 rounded-2xl p-4 text-center">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                    <div className="text-xs font-semibold text-brand-600 mt-1">{stat.trend} this month</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Most Restaurant QR Codes Are{' '}
            <span className="text-red-400">Wasting Your Potential</span>
          </h2>
          <p className="text-gray-400 text-lg mb-12">While you sleep, your competitors are getting reviews. Here's why:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📄', title: 'Static PDF Menus', desc: 'No engagement, no data, no reviews. Just a boring link that customers forget.' },
              { icon: '😡', title: 'Public Negative Reviews', desc: 'Unhappy customers go straight to Google. One bad review can cost you 30 customers.' },
              { icon: '📊', title: 'Zero Analytics', desc: 'You have no idea who scanned, when, what they liked, or why they didn\'t return.' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-800 rounded-2xl p-6 text-left border border-gray-700">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The Smart Review Funnel
            </h2>
            <p className="text-gray-600 text-lg">One QR scan. Maximum reviews. Zero bad press.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-brand-200 to-brand-400"></div>
            {[
              {
                step: '01',
                icon: '📱',
                title: 'Customer Scans QR',
                desc: 'They scan the QR on their table, bill, or takeaway bag. Opens a beautiful restaurant page with your menu and offers.',
                color: 'bg-blue-50 border-blue-200',
                textColor: 'text-blue-600',
              },
              {
                step: '02',
                icon: '⭐',
                title: 'AI Detects Sentiment',
                desc: 'Customer rates their experience. Happy? Gets a pre-written AI review ready to copy & post on Google.',
                color: 'bg-brand-50 border-brand-200',
                textColor: 'text-brand-600',
              },
              {
                step: '03',
                icon: '🛡️',
                title: 'Negative? Goes Private',
                desc: 'Unhappy customers send feedback directly to you — NOT on Google. You can resolve it before it goes public.',
                color: 'bg-amber-50 border-amber-200',
                textColor: 'text-amber-600',
              },
            ].map((item) => (
              <div key={item.step} className={`${item.color} border-2 rounded-2xl p-6 relative`}>
                <div className={`text-xs font-black ${item.textColor} mb-3`}>{item.step}</div>
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything Your Restaurant Needs
            </h2>
            <p className="text-gray-600 text-lg">Linktree + Review Booster + CRM + AI — for restaurants</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'AI Review Generator', desc: 'Claude AI crafts personalized, natural-sounding review suggestions based on the customer\'s rating and your dishes.' },
              { icon: '📱', title: 'Smart QR Codes', desc: 'Multiple QR types: table, bill, takeaway. Each tracked separately. Dynamic behavior based on time of day.' },
              { icon: '🍽️', title: 'Digital Menu CMS', desc: 'Beautiful categorized menu with photos, veg/non-veg badges, best-seller tags. Update anytime.' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'Scan heatmaps, peak hours, review conversion rates, sentiment trends. Know your customers.' },
              { icon: '🛡️', title: 'Reputation Shield', desc: 'Negative feedback captured privately before it reaches Google. Protect your hard-earned ratings.' },
              { icon: '🎯', title: 'AI Insights', desc: 'AI analyzes all feedback to surface top complaints, praises, and actionable recommendations.' },
              { icon: '📣', title: 'Marketing AI', desc: 'Generate Instagram captions, WhatsApp campaigns, and festival offers with one click.' },
              { icon: '💬', title: 'AI Review Replies', desc: 'Respond to Google reviews instantly with AI-generated, personalized, professional replies.' },
              { icon: '🎁', title: 'Offers & Promotions', desc: 'Showcase daily specials, loyalty offers, and seasonal promotions right on the customer\'s QR page.' },
            ].map((feature) => (
              <div key={feature.title} className="card hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Simple, Honest Pricing</h2>
            <p className="text-gray-600 text-lg">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Basic',
                price: '₹999',
                period: '/month',
                desc: 'Perfect for a single restaurant',
                features: ['1 Restaurant', '1 QR Code', 'Digital Menu', 'Review Funnel', 'Basic Analytics', 'Email Support'],
                cta: 'Start Free Trial',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '₹2,999',
                period: '/month',
                desc: 'For growing restaurants',
                features: ['1 Restaurant', '10 QR Codes', 'Digital Menu + Offers', 'AI Review Generator', 'Advanced Analytics', 'AI Feedback Analysis', 'Marketing AI', 'Priority Support'],
                cta: 'Start Free Trial',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: '₹9,999',
                period: '/month',
                desc: 'For chains and franchises',
                features: ['Unlimited Restaurants', 'Unlimited QR Codes', 'All Pro Features', 'Multi-branch Analytics', 'API Access', 'Custom Branding', 'Dedicated Manager'],
                cta: 'Contact Sales',
                highlight: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 ${plan.highlight ? 'bg-brand-600 text-white shadow-2xl scale-105' : 'bg-gray-50 border border-gray-200'}`}>
                {plan.highlight && <div className="text-xs font-black text-brand-200 mb-2 tracking-wider">MOST POPULAR</div>}
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.highlight ? 'text-brand-100' : 'text-gray-500'}`}>{plan.desc}</p>
                <div className="mb-6">
                  <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-brand-100' : 'text-gray-500'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-white' : 'text-gray-600'}`}>
                      <span className={plan.highlight ? 'text-brand-200' : 'text-brand-500'}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block text-center py-3 rounded-xl font-semibold transition-all ${plan.highlight ? 'bg-white text-brand-600 hover:bg-brand-50' : 'bg-brand-600 text-white hover:bg-brand-700'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Restaurants Love ScanFlow</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'Ankit Sharma', restaurant: 'The Biryani Box, Mumbai', stars: 5, text: 'In 3 months, our Google reviews went from 120 to 340. The AI review suggestion feature is a game-changer. Customers actually post reviews now!' },
              { name: 'Priya Menon', restaurant: 'Café Bloom, Bangalore', stars: 5, text: 'We caught 3 serious complaints before they went to Google. The private feedback feature alone is worth the subscription price.' },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="text-amber-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed italic">"{t.text}"</p>
                <div className="font-semibold text-gray-900">{t.name}</div>
                <div className="text-sm text-gray-500">{t.restaurant}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-600 to-emerald-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Ready to Grow Your Reviews?
          </h2>
          <p className="text-brand-100 text-xl mb-10">
            Set up in 5 minutes. First 14 days free. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-white text-brand-600 font-bold text-lg py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 active:scale-95">
            Start Your Free Trial Today →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-emerald-400 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">SF</span>
              </div>
              <span className="text-white font-bold text-lg">ScanFlow</span>
              <span className="text-gray-600 ml-2 text-sm">© 2026</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
              <Link href="/r/spice-garden" className="hover:text-white transition-colors">Demo</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
