import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  googleReviewUrl: z.string().url().optional().or(z.literal('')),
  googleMapsUrl: z.string().url().optional().or(z.literal('')),
  instagram: z.string().optional(),
  wifiPassword: z.string().optional(),
  primaryColor: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const restaurants = await prisma.restaurant.findMany({
    where: { ownerId: session.user.id },
    include: {
      _count: { select: { feedback: true, scans: true, qrCodes: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(restaurants)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    let slug = slugify(data.name)
    const existing = await prisma.restaurant.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const restaurant = await prisma.restaurant.create({
      data: {
        ...data,
        slug,
        ownerId: session.user.id,
        email: data.email || undefined,
        googleReviewUrl: data.googleReviewUrl || undefined,
        googleMapsUrl: data.googleMapsUrl || undefined,
      },
    })

    return NextResponse.json(restaurant)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
