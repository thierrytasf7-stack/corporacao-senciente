import { Router, Response } from 'express'
import { whitelistFilterMiddleware, ScrapeRequest } from '../middleware/whitelist-filter'

const router = Router()

/**
 * EXAMPLE: Scraper route with whitelist filtering
 *
 * Usage:
 * GET /api/scrape?sourceUrl=https://example.com/data
 *
 * The middleware will:
 * 1. Extract domain from sourceUrl parameter
 * 2. Check if domain is whitelisted
 * 3. Block request if domain is not authorized
 * 4. Log blocked attempts to audit log
 */
router.get('/scrape', whitelistFilterMiddleware, (req: ScrapeRequest, res: Response) => {
  // If we reach here, the source is whitelisted
  const { sourceUrl } = req.query

  // Implement your scraping logic here
  res.json({
    success: true,
    message: 'Scraping authorized',
    sourceUrl,
    scraped: {
      // Your scraped data
      example: 'data'
    }
  })
})

/**
 * EXAMPLE: POST endpoint with sourceUrl in body
 */
router.post('/scrape', whitelistFilterMiddleware, (req: ScrapeRequest, res: Response) => {
  const { sourceUrl, options } = req.body

  res.json({
    success: true,
    message: 'Scraping authorized',
    sourceUrl,
    options
  })
})

export default router
