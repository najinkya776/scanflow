import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const restaurantId = searchParams.get('restaurantId')
  if (!restaurantId) return NextResponse.json({ error: 'restaurantId required' }, { status: 400 })

  const restaurant = await prisma.restaurant.findFirst({ where: { id: restaurantId, ownerId: session.user.id } })
  if (!restaurant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [scans, feedback, totalScans, totalFeedback] = await Promise.all([
    prisma.scan.findMany({ where: { restaurantId, createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true } }),
    prisma.feedback.findMany({ where: { restaurantId }, select: { rating: true, sentiment: true, redirectedToGoogle: true, createdAt: true } }),
    prisma.scan.count({ where: { restaurantId } }),
    prisma.feedback.count({ where: { restaurantId } }),
  ])

  const scansByDay: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    scansByDay[key] = 0
  }
  scans.forEach((scan) => {
    const key = new Date(scan.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    if (scansByDay[key] !== undefined) scansByDay[key]++
  })

  const ratingCounts: Record<string, number> = { excellent: 0, good: 0, average: 0, bad: 0 }
  feedback.forEach((f) => { ratingCounts[f.rating] = (ratingCounts[f.rating] ?? 0) + 1 })

  const positiveFeedback = feedback.filter((f) => f.sentiment === 'positive').length
  const googleRedirects = feedback.filter((f) => f.redirectedToGoogle).length
  const reviewConversionRate = positiveFeedback > 0 ? Math.round((googleRedirects / positiveFeedback) * 100) : 0

  const negativeFeedback = feedback.filter((f) => f.sentiment === 'negative').length
  const sentimentScore = totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0

  const recentFeedbackByDay: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    recentFeedbackByDay[key] = 0
  }
  feedback
    .filter((f) => new Date(f.createdAt) >= sevenDaysAgo)
    .forEach((f) => {
      const key = new Date(f.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      if (recentFeedbackByDay[key] !== undefined) recentFeedbackByDay[key]++
    })

  const chartData = Object.entries(scansByDay).map(([date, scansCount]) => ({
    date,
    scans: scansCount,
    feedback: recentFeedbackByDay[date] ?? 0,
  }))

  const ratingDistribution = [
    { name: 'Excellent', value: ratingCounts.excellent, color: '#22c55e' },
    { name: 'Good', value: ratingCounts.good, color: '#3b82f6' },
    { name: 'Average', value: ratingCounts.average, color: '#f59e0b' },
    { name: 'Bad', value: ratingCounts.bad, color: '#ef4444' },
  ]

  return NextResponse.json({
    summary: {
      totalScans,
      totalFeedback,
      positiveFeedback,
      negativeFeedback,
      googleRedirects,
      reviewConversionRate,
      sentimentScore,
    },
    chartData,
    ratingDistribution,
  })
}
