import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const submitSchema = z.object({
  restaurantId: z.string(),
  rating: z.enum(['excellent', 'good', 'average', 'bad']),
  comment: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  qrCodeId: z.string().optional(),
  qrType: z.string().optional(),
  tableNumber: z.string().optional(),
  redirectedToGoogle: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const restaurantId = searchParams.get('restaurantId')
  if (!restaurantId) return NextResponse.json({ error: 'restaurantId required' }, { status: 400 })

  const restaurant = await prisma.restaurant.findFirst({ where: { id: restaurantId, ownerId: session.user.id } })
  if (!restaurant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const feedback = await prisma.feedback.findMany({
    where: { restaurantId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(feedback)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = submitSchema.parse(body)

    const restaurant = await prisma.restaurant.findUnique({ where: { id: data.restaurantId } })
    if (!restaurant) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })

    const sentiment = ['excellent', 'good'].includes(data.rating) ? 'positive' : 'negative'
    const isPublic = false

    const feedback = await prisma.feedback.create({
      data: {
        ...data,
        sentiment,
        isPublic,
        redirectedToGoogle: data.redirectedToGoogle ?? false,
      },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
