import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function askClaude(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    system: 'You are a K-RERA regulatory intelligence assistant for Karnataka real estate officers. Provide concise, accurate, and actionable information about RERA compliance, project risks, and regulatory actions.'
  })

  const block = message.content[0]
  if (block.type === 'text') return block.text
  return 'Unable to generate response.'
}
