import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'item'
  const body = await req.json()

  if (type === 'category') {
    const updated = await prisma.menuCategory.update({ where: { id: params.id }, data: body })
    return NextResponse.json(updated)
  } else {
    const updated = await prisma.menuItem.update({ where: { id: params.id }, data: body })
    return NextResponse.json(updated)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'item'

  if (type === 'category') {
    await prisma.menuCategory.delete({ where: { id: params.id } })
  } else {
    await prisma.menuItem.delete({ where: { id: params.id } })
  }

  return NextResponse.json({ success: true })
}
