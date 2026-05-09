import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateReviewReply } from '@/lib/ai'
import { z } from 'zod'

const schema = z.object({
  restaurantName: z.string(),
  reviewText: z.string(),
  rating: z.string(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-api-key-here') {
      return NextResponse.json({
        reply: `Thank you so much for your kind words! We're thrilled you enjoyed your visit to ${data.restaurantName}. We look forward to welcoming you back soon!`,
      })
    }

    const reply = await generateReviewReply(data)
    return NextResponse.json({ reply })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to generate reply' }, { status: 500 })
  }
}
