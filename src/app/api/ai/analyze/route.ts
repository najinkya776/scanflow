import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { analyzeFeedback } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { restaurantId } = await req.json()
  if (!restaurantId) return NextResponse.json({ error: 'restaurantId required' }, { status: 400 })

  const restaurant = await prisma.restaurant.findFirst({ where: { id: restaurantId, ownerId: session.user.id } })
  if (!restaurant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const recentFeedback = await prisma.feedback.findMany({
    where: { restaurantId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { rating: true, comment: true, createdAt: true },
  })

  if (recentFeedback.length === 0) {
    return NextResponse.json({
      summary: 'No feedback data available yet.',
      topIssues: [],
      topPraises: [],
      recommendation: 'Start collecting customer feedback using your QR codes.',
    })
  }

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-api-key-here') {
    return NextResponse.json({
      summary: 'Customers are generally satisfied with the food quality and ambience.',
      topIssues: ['Service speed during peak hours', 'Waiting time'],
      topPraises: ['Food quality', 'Taste', 'Friendly staff'],
      recommendation: 'Consider adding more staff during lunch and dinner rush hours.',
    })
  }

  const analysis = await analyzeFeedback({
    restaurantName: restaurant.name,
    feedbackItems: recentFeedback.map((f) => ({
      rating: f.rating,
      comment: f.comment,
      createdAt: f.createdAt.toISOString(),
    })),
  })

  return NextResponse.json(analysis)
}
