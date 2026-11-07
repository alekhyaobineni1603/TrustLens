import OpenAI from 'openai';

let client;
function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  client ||= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}
export async function extractClaims(text) {
  const ai = getClient();
  if (!ai) return [{ claimText: text.slice(0, 1200), claimType: 'VERIFIABLE' }];
  const response = await ai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Extract up to 5 distinct objectively verifiable factual claims. Exclude opinions and predictions. Return JSON: {"claims":[{"claimText":"...","claimType":"VERIFIABLE"}]}.' },
      { role: 'user', content: text.slice(0, 12000) }
    ]
  });
  const parsed = JSON.parse(response.choices[0].message.content || '{}');
  return (parsed.claims || []).filter(c => c.claimText).slice(0, 5);
}

export async function assessClaim(claimText, evidence) {
  const ai = getClient();
  if (!ai || !evidence.length) return {
    assessment: 'INSUFFICIENT_EVIDENCE',
    explanation: evidence.length ? 'Evidence was retrieved, but automated assessment is unavailable because no AI provider is configured.' : 'No relevant external evidence was retrieved. Absence of evidence does not establish that the claim is false.',
    confidence: null
  };
  const response = await ai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: `Evaluate only using the supplied evidence. Never invent facts or sources. If evidence is weak, conflicting, indirect, or insufficient, choose INSUFFICIENT_EVIDENCE or MIXED_EVIDENCE. Allowed labels: SUPPORTED, LIKELY_SUPPORTED, MIXED_EVIDENCE, LIKELY_FALSE, FALSE, INSUFFICIENT_EVIDENCE. Return JSON with assessment, explanation, confidence (integer 0-100 or null). Confidence is a heuristic, not calibrated probability.` },
      { role: 'user', content: JSON.stringify({ claim: claimText, evidence: evidence.map(e => ({ title: e.title, url: e.url, content: e.content?.slice(0, 1600), domain: e.domain })) }) }
    ]
  });
  const result = JSON.parse(response.choices[0].message.content || '{}');
  const allowed = ['SUPPORTED','LIKELY_SUPPORTED','MIXED_EVIDENCE','LIKELY_FALSE','FALSE','INSUFFICIENT_EVIDENCE'];
  return {
    assessment: allowed.includes(result.assessment) ? result.assessment : 'INSUFFICIENT_EVIDENCE',
    explanation: String(result.explanation || 'The available evidence was insufficient for a reliable conclusion.').slice(0, 2500),
    confidence: Number.isFinite(result.confidence) ? Math.max(0, Math.min(100, result.confidence)) : null
  };
}
