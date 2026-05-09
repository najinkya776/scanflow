import { NextRequest, NextResponse } from 'next/server'
import { generateReviewSuggestion } from '@/lib/ai'
import { z } from 'zod'

const schema = z.object({
  restaurantName: z.string(),
  rating: z.string(),
  dishes: z.array(z.string()).optional(),
  context: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-api-key-here') {
      const fallbacks: Record<string, string> = {
        excellent: `Absolutely loved dining at ${data.restaurantName}! The food was outstanding and the service was impeccable. Highly recommend to anyone looking for a memorable meal!`,
        good: `Had a great time at ${data.restaurantName}. The food was delicious and the staff were very friendly. Will definitely be coming back!`,
      }
      return NextResponse.json({ review: fallbacks[data.rating] ?? fallbacks.good })
    }

    const review = await generateReviewSuggestion(data)
    return NextResponse.json({ review })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to generate review' }, { status: 500 })
  }
}
