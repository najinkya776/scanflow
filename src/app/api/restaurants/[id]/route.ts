import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function getRestaurantForUser(id: string, userId: string) {
  return prisma.restaurant.findFirst({ where: { id, ownerId: userId } })
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const restaurant = await getRestaurantForUser(params.id, session.user.id)
  if (!restaurant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const full = await prisma.restaurant.findUnique({
    where: { id: params.id },
    include: {
      menuCategories: { include: { items: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } },
      qrCodes: { orderBy: { createdAt: 'desc' } },
      offers: { where: { isActive: true } },
      _count: { select: { feedback: true, scans: true } },
    },
  })

  return NextResponse.json(full)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const restaurant = await getRestaurantForUser(params.id, session.user.id)
  if (!restaurant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.restaurant.update({
    where: { id: params.id },
    data: body,
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const restaurant = await getRestaurantForUser(params.id, session.user.id)
  if (!restaurant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.restaurant.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
