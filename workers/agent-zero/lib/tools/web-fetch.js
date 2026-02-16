/**
 * Agent Zero v3.0 - Tool: web_fetch
 * Fetches a URL and returns clean text content.
 */
const https = require('https');
const http = require('http');
const { URL } = require('url');

class WebFetchTool {
  constructor(config, projectRoot) {
    this.config = config;
    this.projectRoot = projectRoot;
  }

  definition() {
    return {
      name: 'web_fetch',
      description: 'Fetch a URL and return clean text content (HTML tags stripped). Use for web scraping, reading web pages, fetching API data.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The URL to fetch (must be https or http)' },
          selector: { type: 'string', description: 'Optional: CSS-like keyword to focus extraction on (e.g., "main", "article", "body")' }
        },
        required: ['url']
      }
    };
  }

  async execute(args) {
    const { url, selector } = args;

    if (!url) return { success: false, error: 'URL is required' };

    // Security: block internal URLs (SSRF prevention)
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
      if (blocked.includes(host) || host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('172.')) {
        return { success: false, error: 'Internal URLs are blocked for security (SSRF prevention)' };
      }
    } catch (e) {
      return { success: false, error: `Invalid URL: ${e.message}` };
    }

    try {
      const html = await this._fetch(url);
      let text = this._htmlToText(html);

      // Focus on selector keyword if provided
      if (selector) {
        const selectorLower = selector.toLowerCase();
        const tagMatch = html.match(new RegExp(`<${selectorLower}[^>]*>([\\s\\S]*?)<\\/${selectorLower}>`, 'i'));
        if (tagMatch) {
          text = this._htmlToText(tagMatch[1]);
        }
      }

      // Truncate
      const maxChars = this.config.security?.max_output_chars || 10000;
      if (text.length > maxChars) {
        text = text.substring(0, maxChars) + '\n[...truncated]';
      }

      return { success: true, data: text, url, chars: text.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  _fetch(url, redirects = 3) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const timeout = this.config.timeouts?.web_fetch || 15000;

      const req = client.get(url, { timeout, headers: { 'User-Agent': 'AgentZero/3.0' } }, (res) => {
        // Follow redirects
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects > 0) {
          const redirectUrl = new URL(res.headers.location, url).href;
          this._fetch(redirectUrl, redirects - 1).then(resolve).catch(reject);
          return;
        }

        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    });
  }

  _htmlToText(html) {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
}

module.exports = WebFetchTool;
