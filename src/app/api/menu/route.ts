import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1),
  restaurantId: z.string(),
  sortOrder: z.number().optional(),
})

const itemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  isVeg: z.boolean().optional(),
  isSpicy: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  categoryId: z.string(),
  restaurantId: z.string(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const restaurantId = searchParams.get('restaurantId')
  if (!restaurantId) return NextResponse.json({ error: 'restaurantId required' }, { status: 400 })

  const restaurant = await prisma.restaurant.findFirst({ where: { id: restaurantId, ownerId: session.user.id } })
  if (!restaurant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'item'

  try {
    const body = await req.json()

    if (type === 'category') {
      const data = categorySchema.parse(body)
      const restaurant = await prisma.restaurant.findFirst({ where: { id: data.restaurantId, ownerId: session.user.id } })
      if (!restaurant) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      const category = await prisma.menuCategory.create({ data })
      return NextResponse.json(category)
    } else {
      const data = itemSchema.parse(body)
      const category = await prisma.menuCategory.findFirst({ where: { id: data.categoryId, restaurantId: data.restaurantId } })
      if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      const { restaurantId: _, ...itemData } = data
      const item = await prisma.menuItem.create({ data: itemData })
      return NextResponse.json(item)
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
