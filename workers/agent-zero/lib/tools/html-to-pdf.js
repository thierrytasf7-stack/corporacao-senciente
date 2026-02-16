/**
 * Agent Zero v3.0 - Tool: html_to_pdf
 * Converts HTML content to PDF using Puppeteer.
 */
const fs = require('fs');
const path = require('path');

class HtmlToPdfTool {
  constructor(config, projectRoot) {
    this.config = config;
    this.projectRoot = projectRoot;
    this.allowedDirs = config.security?.file_write_dirs || [
      'results/', 'data/', 'workers/agent-zero/output/'
    ];
  }

  definition() {
    return {
      name: 'html_to_pdf',
      description: 'Convert HTML content to a PDF file using headless browser. Output path must be in allowed directories (results/, data/, workers/agent-zero/output/).',
      parameters: {
        type: 'object',
        properties: {
          html: { type: 'string', description: 'HTML content to convert to PDF' },
          output_path: { type: 'string', description: 'Relative output path for the PDF (e.g., "results/report.pdf")' },
          options: {
            type: 'object',
            description: 'Optional PDF options',
            properties: {
              format: { type: 'string', description: 'Page format: A4, Letter, etc. Default: A4' },
              landscape: { type: 'boolean', description: 'Landscape orientation. Default: false' },
              margin: { type: 'string', description: 'Margin size. Default: "1cm"' }
            }
          }
        },
        required: ['html', 'output_path']
      }
    };
  }

  async execute(args) {
    const { html, output_path, options = {} } = args;

    if (!html) return { success: false, error: 'HTML content is required' };
    if (!output_path) return { success: false, error: 'Output path is required' };

    // Security: check path
    const resolved = path.resolve(this.projectRoot, output_path);
    if (!resolved.startsWith(this.projectRoot)) {
      return { success: false, error: 'Path traversal blocked' };
    }

    const normalizedPath = output_path.replace(/\\/g, '/');
    const isAllowed = this.allowedDirs.some(dir => normalizedPath.startsWith(dir));
    if (!isAllowed) {
      return {
        success: false,
        error: `Write blocked: path must start with one of: ${this.allowedDirs.join(', ')}`
      };
    }

    try {
      // Lazy-load puppeteer
      let puppeteer;
      try {
        puppeteer = require('puppeteer');
      } catch (e) {
        return { success: false, error: 'Puppeteer not installed. Run: npm install puppeteer' };
      }

      // Create parent dir
      const dir = path.dirname(resolved);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 20000 });

      const margin = options.margin || '1cm';
      await page.pdf({
        path: resolved,
        format: options.format || 'A4',
        landscape: options.landscape || false,
        margin: { top: margin, right: margin, bottom: margin, left: margin },
        printBackground: true
      });

      await browser.close();

      const stat = fs.statSync(resolved);
      return {
        success: true,
        path: output_path,
        bytes: stat.size
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = HtmlToPdfTool;
