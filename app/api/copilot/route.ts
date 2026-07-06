import { NextRequest, NextResponse } from 'next/server'
import {
  conversationalAnswer, strongMatch, buildOntologyContext, VALID_IDS, UNKNOWN_ANSWER,
} from '@/lib/ontology'

// Cross-Stage Copilot — Ontology-Augmented Generation.
// Order: greeting/meta → strong seeded (stage-safe) → grounded LLM over the FULL
// ontology. Answers strictly from the injected objects; never invents. Graceful
// "I don't have that" on any gap/failure. Server-side key, never exposed.
export async function POST(req: NextRequest) {
  const { query } = await req.json().catch(() => ({ query: '' }))
  const q = (query || '').toString().trim()

  // 1. greeting / help / thanks — deterministic, always works
  const convo = conversationalAnswer(q)
  if (convo) return NextResponse.json(convo)

  // 2. strong/exact seeded match — the known-good demo answers (stage-safe)
  const strong = strongMatch(q)
  if (strong) return NextResponse.json(strong.answer)

  // 3. grounded, free-form reasoning over the full ontology
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || !q) return NextResponse.json(UNKNOWN_ANSWER)

  const context = buildOntologyContext(q)

  const system =
    'You are the Vantis Cross-Stage Copilot — a grounded analyst for a K-RERA / lender real-estate intelligence layer.\n\n' +
    'STRICT RULES:\n' +
    '1. Use ONLY the JSON in CONTEXT. Never use outside knowledge or assumptions.\n' +
    '2. Quote every number (execution scores, %s, ₹ amounts, gaps) EXACTLY as given in CONTEXT. Never recompute, estimate, round, or invent a number.\n' +
    '3. Only the projects, developers, and objects in CONTEXT exist. Never invent a project, developer, case, unit, or fact.\n' +
    '4. If the question asks about anything NOT in CONTEXT (an unknown project/developer/number, or data you were not given), you MUST answer with paras exactly ["I don\'t have that in my current dataset — I track the 4 watchlist projects (Ozone Urbana, Skylark Arcadia, Divya Villas, Prestige Lakeside) and their linked objects."] and verdict null. Do NOT guess.\n' +
    '5. SiteVerification / CV "delivered %" and any live ingestion are roadmap/mock — never imply they are live third-party or government feeds.\n' +
    '6. Be concise and factual: 1–4 short paragraphs.\n\n' +
    'Return STRICT JSON only (no prose outside it), matching:\n' +
    '{"chips":string[] (subset of ["QPR FILING","SITE VERIFICATION","ESCROW","LITIGATION","ENCUMBRANCE"]; [] if not applicable),' +
    '"paras":string[] (1-4 short HTML paragraphs; you may use <strong style="color:#fff;"> and <span style="color:#8fb3ff|#45e0c0|#ff7a6d;">),' +
    '"verdict":{"eyebrow":string,"title":string,"sub":string,"score":number,"tier":"AT_RISK"|"WATCH"|"HEALTHY"}|null (include only for a clear risk verdict; score MUST be an execution_score present in CONTEXT),' +
    '"contrast":string|null,"citations":string[] (labels/ids of objects you used),' +
    '"focusIds":string[] (ids from CONTEXT to highlight in the graph)}'

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system,
        messages: [{ role: 'user', content: 'CONTEXT:\n' + JSON.stringify(context) + '\n\nQUESTION: ' + q + '\n\nReturn the JSON answer.' }],
      }),
    })
    if (!res.ok) return NextResponse.json(UNKNOWN_ANSWER)
    const data = await res.json()
    const text: string = data.content?.[0]?.text ?? ''
    const s = text.indexOf('{'), e = text.lastIndexOf('}')
    if (s < 0 || e < 0) return NextResponse.json(UNKNOWN_ANSWER)
    const parsed = JSON.parse(text.slice(s, e + 1))
    if (!Array.isArray(parsed.paras) || !parsed.paras.length) return NextResponse.json(UNKNOWN_ANSWER)

    // Guardrails: clean the model output to valid, grounded shapes.
    const validFocus = Array.isArray(parsed.focusIds) ? parsed.focusIds.filter((id: unknown) => typeof id === 'string' && VALID_IDS.has(id)) : []
    parsed.focusIds = validFocus.length ? validFocus : UNKNOWN_ANSWER.focusIds
    if (!Array.isArray(parsed.chips)) parsed.chips = []
    if (!Array.isArray(parsed.citations)) parsed.citations = []
    if (parsed.verdict && typeof parsed.verdict.score !== 'number') parsed.verdict = null
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json(UNKNOWN_ANSWER)
  }
}
