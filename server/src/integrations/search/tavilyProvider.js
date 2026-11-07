import axios from 'axios';

export async function searchEvidence(query) {
  if (!process.env.TAVILY_API_KEY) return [];
  const { data } = await axios.post('https://api.tavily.com/search', {
    api_key: process.env.TAVILY_API_KEY,
    query,
    search_depth: 'advanced',
    max_results: 5,
    include_answer: false
  }, { timeout: 15000 });
  return (data.results || []).map(r => ({
    title: r.title || 'Untitled source',
    url: r.url,
    content: r.content || '',
    domain: safeDomain(r.url),
    score: r.score
  })).filter(r => r.url && /^https?:\/\//i.test(r.url));
}
function safeDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}
