import Anthropic from '@anthropic-ai/sdk'

const getClient = () =>
  new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateReviewSuggestion(params: {
  restaurantName: string
  rating: string
  dishes?: string[]
  context?: string
}): Promise<string> {
  const client = getClient()
  const { restaurantName, rating, dishes, context } = params

  const dishesText = dishes?.length ? `The customer mentioned enjoying: ${dishes.join(', ')}.` : ''
  const contextText = context ? `Additional context: ${context}` : ''
  const tone = rating === 'excellent' ? 'very enthusiastic and glowing' : 'positive and appreciative'

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    messages: [
      {
        role: 'user',
        content: `Write a short, natural, ${tone} Google review for "${restaurantName}" restaurant.
${dishesText} ${contextText}
Keep it 2-3 sentences. Sound like a real customer. No quotes around the review. Just the review text directly.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') return content.text.trim()
  return `Great experience at ${restaurantName}! The food was delicious and the service was excellent. Highly recommend!`
}

export async function generateReviewReply(params: {
  restaurantName: string
  reviewText: string
  rating: string
}): Promise<string> {
  const client = getClient()
  const { restaurantName, reviewText, rating } = params
  const tone = ['excellent', 'good'].includes(rating) ? 'warm and grateful' : 'apologetic and empathetic'

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 120,
    messages: [
      {
        role: 'user',
        content: `Write a short, ${tone} reply from "${restaurantName}" to this customer review: "${reviewText}"
Keep it 2 sentences max. Professional, genuine, and personal. Just the reply text directly.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') return content.text.trim()
  return `Thank you for your feedback! We appreciate you visiting ${restaurantName} and hope to serve you again soon.`
}

export async function analyzeFeedback(params: {
  restaurantName: string
  feedbackItems: Array<{ rating: string; comment: string | null; createdAt: string }>
}): Promise<{
  summary: string
  topIssues: string[]
  topPraises: string[]
  recommendation: string
}> {
  const client = getClient()
  const { restaurantName, feedbackItems } = params

  const feedbackText = feedbackItems
    .map((f) => `[${f.rating}] ${f.comment || 'No comment'}`)
    .join('\n')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: `Analyze this customer feedback for "${restaurantName}" restaurant and respond with ONLY valid JSON:
${feedbackText}

Respond with this exact JSON structure:
{
  "summary": "2-sentence overall summary",
  "topIssues": ["issue1", "issue2", "issue3"],
  "topPraises": ["praise1", "praise2", "praise3"],
  "recommendation": "1 actionable recommendation"
}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') {
    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) return JSON.parse(jsonMatch[0])
    } catch {}
  }

  return {
    summary: 'Overall customer sentiment is mixed with positive experiences noted.',
    topIssues: ['Service speed', 'Temperature of food'],
    topPraises: ['Food quality', 'Ambience', 'Staff friendliness'],
    recommendation: 'Focus on improving service speed during peak hours.',
  }
}

export async function generateMarketingContent(params: {
  restaurantName: string
  type: 'instagram' | 'whatsapp' | 'offer'
  context?: string
}): Promise<string> {
  const client = getClient()
  const { restaurantName, type, context } = params

  const typeInstructions: Record<string, string> = {
    instagram: 'an engaging Instagram caption with relevant emojis and 3-4 hashtags',
    whatsapp: 'a friendly WhatsApp promotional message for existing customers',
    offer: 'a compelling promotional offer announcement',
  }

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `Write ${typeInstructions[type]} for "${restaurantName}" restaurant.
${context ? `Context: ${context}` : ''}
Keep it concise and engaging. Just the content directly, no preamble.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') return content.text.trim()
  return `Visit ${restaurantName} for an unforgettable dining experience!`
}
