import Analysis from '../models/Analysis.js';
import TrustedSource from '../models/TrustedSource.js';
import { extractClaims, assessClaim } from '../integrations/ai/openaiProvider.js';
import { searchEvidence } from '../integrations/search/tavilyProvider.js';
import { fetchArticle } from './contentService.js';

const sourceDefaults = [
  ['Government of India','india.gov.in','OFFICIAL'],
  ['World Health Organization','who.int','OFFICIAL'],
  ['United Nations','un.org','OFFICIAL'],
  ['Reuters','reuters.com','ESTABLISHED'],
  ['Associated Press','apnews.com','ESTABLISHED'],
  ['BBC News','bbc.com','ESTABLISHED'],
  ['AFP Fact Check','factcheck.afp.com','FACT_CHECKER'],
  ['Alt News','altnews.in','FACT_CHECKER']
];

export async function seedSources() {
  for (const [name, domain, trustClassification] of sourceDefaults) {
    await TrustedSource.updateOne({ domain }, { $setOnInsert: { name, domain, trustClassification, category: trustClassification } }, { upsert: true });
  }
}

export async function createAnalysis(userId, input) {
  const type = input.submissionType;
  let originalText = input.text || '';
  let originalUrl = input.url;
  let extractedTitle = '';
  let extractedContent = originalText;
  if (type === 'URL') {
    const article = await fetchArticle(input.url);
    extractedTitle = article.title;
    extractedContent = article.text;
    originalText = article.text;
  }
  const max = Number(process.env.MAX_SUBMISSION_CHARS || 30000);
  if (!extractedContent.trim() || extractedContent.length > max) throw Object.assign(new Error(`Content must be between 1 and ${max} characters`), { statusCode: 400 });

  const analysis = await Analysis.create({
    userId, submissionType: type, originalText: input.text || '',
    originalUrl, extractedTitle, extractedContent, status: 'PROCESSING',
    limitations: []
  });

  try {
    const extracted = await extractClaims(extractedContent);
    const claims = [];
    for (let i = 0; i < extracted.length; i++) {
      const claim = extracted[i];
      let found = [];
      try { found = await searchEvidence(claim.claimText); }
      catch (e) { analysis.limitations.push('One or more evidence searches failed; results may be incomplete.'); }
      const activeSources = await TrustedSource.find({ isActive: true }).select('domain trustClassification').lean();
      const sourceMap = new Map(activeSources.map(s => [s.domain, s]));
      const evidence = found.map(item => {
        const source = sourceMap.get(item.domain);
        return {
          sourceName: item.title,
          sourceUrl: item.url,
          sourceDomain: item.domain,
          sourceCategory: source?.trustClassification || 'UNVERIFIED',
          relevantExcerpt: item.content.slice(0, 2000),
          relevanceScore: item.score,
          evidenceRelationship: 'NEUTRAL'
        };
      });
      const assessment = await assessClaim(claim.claimText, found);
      claims.push({
        claimText: claim.claimText,
        claimType: claim.claimType || 'VERIFIABLE',
        assessment: assessment.assessment,
        explanation: assessment.explanation,
        confidence: assessment.confidence,
        position: i,
        evidence
      });
    }
    const labels = claims.map(c => c.assessment);
    let overall = 'INSUFFICIENT_EVIDENCE';
    if (labels.includes('MIXED_EVIDENCE')) overall = 'MIXED_EVIDENCE';
    else if (labels.includes('FALSE')) overall = 'FALSE';
    else if (labels.includes('LIKELY_FALSE')) overall = 'LIKELY_FALSE';
    else if (labels.length && labels.every(x => x === 'SUPPORTED')) overall = 'SUPPORTED';
    else if (labels.length && labels.every(x => ['SUPPORTED','LIKELY_SUPPORTED'].includes(x))) overall = 'LIKELY_SUPPORTED';
    else if (labels.some(x => ['SUPPORTED','LIKELY_SUPPORTED'].includes(x)) && labels.some(x => ['FALSE','LIKELY_FALSE'].includes(x))) overall = 'MIXED_EVIDENCE';

    const confidenceValues = claims.map(c => c.confidence).filter(Number.isFinite);
    analysis.claims = claims;
    analysis.overallAssessment = overall;
    analysis.confidence = confidenceValues.length ? Math.round(confidenceValues.reduce((a,b) => a+b, 0) / confidenceValues.length) : null;
    analysis.summary = `Analyzed ${claims.length} claim(s). Overall assessment: ${overall.replaceAll('_', ' ').toLowerCase()}. Review the evidence and limitations before drawing a conclusion.`;
    if (!process.env.OPENAI_API_KEY) analysis.limitations.push('AI provider is not configured. The system used a basic claim fallback and cannot provide an AI evidence assessment.');
    if (!process.env.TAVILY_API_KEY) analysis.limitations.push('Search provider is not configured. No live external evidence was retrieved.');
    analysis.status = 'COMPLETED';
    analysis.completedAt = new Date();
    await analysis.save();
    return analysis;
  } catch (error) {
    analysis.status = 'FAILED';
    analysis.failureMessage = 'Analysis could not be completed. Please retry later.';
    await analysis.save();
    throw error;
  }
}
