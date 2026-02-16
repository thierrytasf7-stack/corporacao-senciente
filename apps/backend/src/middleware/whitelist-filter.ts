import { Request, Response, NextFunction } from 'express'
import { getWhitelistManager } from './source-whitelist'

export interface ScrapeRequest extends Request {
  sourceUrl?: string
  isAllowed?: boolean
}

/**
 * Middleware para filtrar requisições de scraping baseado na whitelist
 * Bloqueia acesso a domínios não autorizados
 */
export const whitelistFilterMiddleware = (
  req: ScrapeRequest,
  res: Response,
  next: NextFunction
): void => {
  const manager = getWhitelistManager()

  // Extract source URL from request
  const sourceUrl = req.query.sourceUrl || req.body?.sourceUrl
  if (!sourceUrl) {
    next()
    return
  }

  // Extract domain from URL
  let domain: string
  try {
    const url = new URL(sourceUrl as string)
    domain = url.hostname
  } catch (error) {
    res.status(400).json({
      error: 'Invalid URL format',
      code: 'INVALID_URL'
    })
    return
  }

  // Check whitelist
  const isAllowed = manager.isSourceAllowed(domain)
  req.sourceUrl = sourceUrl as string
  req.isAllowed = isAllowed

  if (!isAllowed) {
    res.status(403).json({
      error: 'Source domain is not whitelisted',
      code: 'UNAUTHORIZED_SOURCE',
      domain
    })
    return
  }

  next()
}

/**
 * Middleware para logging de acessos bloqueados
 */
export const auditLoggingMiddleware = (
  req: ScrapeRequest,
  res: Response,
  next: NextFunction
): void => {
  const manager = getWhitelistManager()

  // Capture response status
  const originalSend = res.send
  res.send = function (data: any) {
    if (!req.isAllowed && req.sourceUrl) {
      const domain = new URL(req.sourceUrl).hostname
      console.warn(
        `[WHITELIST] Blocked access to domain: ${domain} at ${new Date().toISOString()}`
      )
    }
    return originalSend.call(this, data)
  }

  next()
}

/**
 * Middleware para adicionar source validation headers
 */
export const sourceValidationHeadersMiddleware = (
  req: ScrapeRequest,
  res: Response,
  next: NextFunction
): void => {
  const manager = getWhitelistManager()

  if (req.sourceUrl) {
    try {
      const domain = new URL(req.sourceUrl).hostname
      const source = manager
        .getWhitelist()
        .find((s) => new URL(`http://${s.domain}`).hostname === domain)

      if (source) {
        res.setHeader('X-Source-Name', source.name)
        res.setHeader('X-Source-Category', source.category)
        res.setHeader(
          'X-Source-Reputation',
          source.reputation.score.toString()
        )
      }
    } catch (error) {
      // Silently fail for invalid URLs
    }
  }

  next()
}
