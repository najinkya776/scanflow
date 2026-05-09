import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  restaurantId: z.string(),
  qrCodeId: z.string().optional(),
  qrType: z.string().optional(),
  tableNumber: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const userAgent = req.headers.get('user-agent') ?? undefined

    const [scan] = await Promise.all([
      prisma.scan.create({ data: { ...data, userAgent } }),
      data.qrCodeId
        ? prisma.qRCode.update({ where: { id: data.qrCodeId }, data: { scans: { increment: 1 } } })
        : Promise.resolve(),
    ])

    return NextResponse.json({ success: true, id: scan.id })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record scan' }, { status: 500 })
  }
}
