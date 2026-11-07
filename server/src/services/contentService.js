import axios from 'axios';
import * as cheerio from 'cheerio';
import AppError from '../utils/AppError.js';

function validatePublicUrl(raw) {
  let url;
  try { url = new URL(raw); } catch { throw new AppError('Invalid URL', 400); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new AppError('Only HTTP and HTTPS URLs are allowed', 400);
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host === '127.0.0.1' || host === '::1' ||
      /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      host === '169.254.169.254') throw new AppError('Private or local network URLs are not allowed', 400);
  return url.toString();
}

export async function fetchArticle(rawUrl) {
  const url = validatePublicUrl(rawUrl);
  try {
    const response = await axios.get(url, {
      timeout: 12000, maxRedirects: 3, responseType: 'text',
      maxContentLength: 2 * 1024 * 1024,
      headers: { 'User-Agent': 'TrustLensResearchBot/1.0 (+content analysis)' }
    });
    const $ = cheerio.load(response.data);
    $('script, style, nav, footer, header, noscript, iframe, form').remove();
    const title = $('meta[property="og:title"]').attr('content') || $('title').first().text() || '';
    const description = $('meta[name="description"]').attr('content') || '';
    const body = $('article').text() || $('main').text() || $('body').text();
    const text = `${description}\n${body}`.replace(/\s+/g, ' ').trim().slice(0, Number(process.env.MAX_SUBMISSION_CHARS || 30000));
    if (!text) throw new Error('No readable article text found');
    return { title: title.trim().slice(0, 300), text };
  } catch (error) {
    if (error.statusCode) throw error;
    throw new AppError('Could not retrieve readable content from this URL. The site may block automated access; try pasting the article text.', 422);
  }
}
