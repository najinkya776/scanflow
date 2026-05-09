import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import QRCode from 'qrcode'
import { z } from 'zod'

const schema = z.object({
  restaurantId: z.string(),
  name: z.string().min(1),
  type: z.enum(['table', 'bill', 'takeaway', 'event']).default('table'),
  tableNumber: z.string().optional(),
  description: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const restaurant = await prisma.restaurant.findFirst({
      where: { id: data.restaurantId, ownerId: session.user.id },
    })
    if (!restaurant) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })

    const qrRecord = await prisma.qRCode.create({
      data: {
        name: data.name,
        type: data.type,
        tableNumber: data.tableNumber,
        description: data.description,
        restaurantId: data.restaurantId,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const url = `${baseUrl}/r/${restaurant.slug}?qr=${qrRecord.id}&type=${data.type}${data.tableNumber ? `&table=${data.tableNumber}` : ''}`

    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })

    return NextResponse.json({ qrCode: qrRecord, qrDataUrl, url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const qrId = searchParams.get('qrId')
  const restaurantSlug = searchParams.get('slug')

  if (!qrId || !restaurantSlug) return NextResponse.json({ error: 'qrId and slug required' }, { status: 400 })

  const qrRecord = await prisma.qRCode.findUnique({ where: { id: qrId } })
  if (!qrRecord) return NextResponse.json({ error: 'QR code not found' }, { status: 404 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const url = `${baseUrl}/r/${restaurantSlug}?qr=${qrId}&type=${qrRecord.type}${qrRecord.tableNumber ? `&table=${qrRecord.tableNumber}` : ''}`

  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: { dark: '#1a1a1a', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  })

  return NextResponse.json({ qrDataUrl, url })
}
