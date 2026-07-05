import { NextRequest, NextResponse } from 'next/server'
import {
  matchScenario, scoredProjects, byId, links, signalsFor,
} from '@/lib/ontology'

// Cross-Stage Copilot — injects the relevant ONTOLOGY OBJECTS (structured, not
// free text) into Claude and asks for a structured answer. Falls back to the
// deterministic seeded scenario on any failure so the demo never breaks.
export async function POST(req: NextRequest) {
  const { query } = await req.json().catch(() => ({ query: '' }))
  const seeded = matchScenario(query || '')

  const key = process.env.ANTHROPIC_API_KEY
  // Graceful fallback: no key → return the seeded structured answer.
  if (!key) return NextResponse.json(seeded.answer)

  // Assemble the structured context: the objects the answer reasons over.
  const focusObjects = seeded.answer.focusIds.map(id => byId[id]).filter(Boolean)
  const focusLinks = links.filter(l => seeded.answer.focusIds.includes(l.from) && seeded.answer.focusIds.includes(l.to))
  const portfolio = scoredProjects().map(p => ({
    project: p.label, developer: p.developerLabel, loan_cr: p.loan_cr,
    execution_score: p.score, status: p.status, ...signalsFor(p.id),
  }))

  const context = { question: query, objects: focusObjects, links: focusLinks, portfolio }

  const system =
    'You are the Vantis Cross-Stage Copilot for a K-RERA / lender intelligence layer. ' +
    'You reason across a typed real-estate ontology: QPR (declared %) → SiteVerification (delivered %, a roadmap CV capability) → EscrowAccount (funded vs 70% mandate) → Litigation → Encumbrance. ' +
    'The declared-vs-delivered gap is the hero signal; execution_score is already derived from the linked objects. ' +
    'Answer ONLY from the supplied objects — cite them. Return STRICT JSON, no prose outside it, matching:\n' +
    '{"chips":string[](subset of ["QPR FILING","SITE VERIFICATION","ESCROW","LITIGATION","ENCUMBRANCE"]),' +
    '"paras":string[](2-4 short HTML paragraphs; you may use <strong> and <span style="color:#8fb3ff/#45e0c0/#ff7a6d">),' +
    '"verdict":{"eyebrow":string,"title":string,"sub":string,"score":number,"tier":"AT_RISK"|"WATCH"|"HEALTHY"}|null,' +
    '"contrast":string|null,"citations":string[],"focusIds":string[]}. ' +
    'Do not claim SiteVerification is computed live — it is a roadmap capability shown with mock data.'

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 900,
        system,
        messages: [{ role: 'user', content: 'CONTEXT OBJECTS:\n' + JSON.stringify(context) + '\n\nReturn the JSON answer.' }],
      }),
    })
    if (!res.ok) return NextResponse.json(seeded.answer)
    const data = await res.json()
    const text: string = data.content?.[0]?.text ?? ''
    const jsonStart = text.indexOf('{'), jsonEnd = text.lastIndexOf('}')
    if (jsonStart < 0 || jsonEnd < 0) return NextResponse.json(seeded.answer)
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1))
    if (!Array.isArray(parsed.paras) || !parsed.paras.length) return NextResponse.json(seeded.answer)
    // ensure a valid focus set for the graph
    if (!Array.isArray(parsed.focusIds) || !parsed.focusIds.length) parsed.focusIds = seeded.answer.focusIds
    if (!Array.isArray(parsed.citations)) parsed.citations = seeded.answer.citations
    if (!Array.isArray(parsed.chips)) parsed.chips = seeded.answer.chips
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json(seeded.answer)
  }
}
