import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateMarketingContent } from '@/lib/ai'
import { z } from 'zod'

const schema = z.object({
  restaurantName: z.string(),
  type: z.enum(['instagram', 'whatsapp', 'offer']),
  context: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-api-key-here') {
      const fallbacks: Record<string, string> = {
        instagram: `✨ Experience authentic flavors at ${data.restaurantName}! Every dish is crafted with love and fresh ingredients. Come taste the difference! 🍽️\n\n#food #restaurant #authentic #foodlover #dining`,
        whatsapp: `Hi! We have exciting offers waiting for you at ${data.restaurantName}. Visit us today and enjoy a special discount on your favorite dishes! Call us to reserve your table.`,
        offer: `SPECIAL OFFER at ${data.restaurantName}! Get 20% off on your next visit. Valid this week only. Don't miss out — bring your family and friends!`,
      }
      return NextResponse.json({ content: fallbacks[data.type] })
    }

    const content = await generateMarketingContent(data)
    return NextResponse.json({ content })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
