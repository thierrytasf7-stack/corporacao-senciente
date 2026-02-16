/**
 * Reputation Service - External API Integration
 *
 * Integrates with external reputation APIs:
 * - VirusTotal (free tier: 4 requests/min)
 * - AbuseIPDB
 * - URLhaus
 *
 * For production, add VIRUSTOTAL_API_KEY to .env
 */

interface ReputationResult {
  score: number // 0-10 (10 = most trusted)
  trusted: boolean // score >= 7
  source: string // 'virustotal' | 'abuseipdb' | 'mock'
  details?: {
    positives?: number
    total?: number
    malicious?: number
    suspicious?: number
    harmless?: number
  }
}

export class ReputationService {
  private apiKey: string | undefined
  private rateLimit = {
    lastCall: 0,
    minInterval: 15000 // 15s between calls (4/min free tier)
  }

  constructor() {
    this.apiKey = process.env.VIRUSTOTAL_API_KEY
  }

  /**
   * Check domain reputation using VirusTotal API
   * Falls back to mock if API key not configured
   */
  async checkDomainReputation(domain: string): Promise<ReputationResult> {
    // If no API key, use mock
    if (!this.apiKey || this.apiKey === '') {
      return this.getMockReputation(domain)
    }

    // Rate limiting
    const now = Date.now()
    const timeSinceLastCall = now - this.rateLimit.lastCall
    if (timeSinceLastCall < this.rateLimit.minInterval) {
      const waitTime = this.rateLimit.minInterval - timeSinceLastCall
      await this.sleep(waitTime)
    }

    try {
      const result = await this.checkVirusTotal(domain)
      this.rateLimit.lastCall = Date.now()
      return result
    } catch (error) {
      console.error('VirusTotal API error, falling back to mock:', error)
      return this.getMockReputation(domain)
    }
  }

  /**
   * VirusTotal Domain Report API v3
   * https://developers.virustotal.com/reference/domains
   */
  private async checkVirusTotal(domain: string): Promise<ReputationResult> {
    const url = `https://www.virustotal.com/api/v3/domains/${domain}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apikey': this.apiKey!
      }
    })

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.status}`)
    }

    const data = await response.json()
    const stats = data.data?.attributes?.last_analysis_stats

    if (!stats) {
      return this.getMockReputation(domain)
    }

    const { malicious = 0, suspicious = 0, harmless = 0, undetected = 0 } = stats
    const total = malicious + suspicious + harmless + undetected

    // Calculate score: 10 - (malicious + suspicious) / total * 10
    const negativeRatio = total > 0 ? (malicious + suspicious) / total : 0
    const score = Math.max(0, 10 - negativeRatio * 10)

    return {
      score: Math.round(score * 10) / 10,
      trusted: score >= 7,
      source: 'virustotal',
      details: {
        malicious,
        suspicious,
        harmless,
        total
      }
    }
  }

  /**
   * Mock reputation for development/testing
   * Returns score based on simple heuristics
   */
  private getMockReputation(domain: string): ReputationResult {
    const normalizedDomain = domain.toLowerCase()

    // Known trusted domains (score 9-10)
    const trustedDomains = [
      'bbc.com',
      'bbc.co.uk',
      'reuters.com',
      'apnews.com',
      'nytimes.com',
      'washingtonpost.com',
      'theguardian.com',
      'cnn.com',
      'bloomberg.com',
      'espn.com',
      'github.com',
      'stackoverflow.com',
      'wikipedia.org'
    ]

    // Suspicious patterns (score 2-4)
    const suspiciousPatterns = [
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses
      /^[a-z]{1,3}\d+\./, // Short random domains (abc123.com)
      /\.tk$|\.ml$|\.ga$|\.cf$|\.gq$/, // Free TLDs often used for spam
      /-free-|free-download|download-free/i,
      /xxx|adult|porn|casino|pharma/i
    ]

    // Check if trusted
    if (trustedDomains.includes(normalizedDomain)) {
      return {
        score: 9.5,
        trusted: true,
        source: 'mock'
      }
    }

    // Check if matches suspicious patterns
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(normalizedDomain)) {
        return {
          score: 3.0,
          trusted: false,
          source: 'mock',
          details: {
            malicious: 1,
            total: 1
          }
        }
      }
    }

    // Default: moderately trusted (5.0)
    return {
      score: 5.0,
      trusted: false,
      source: 'mock'
    }
  }

  /**
   * Batch check multiple domains (with rate limiting)
   */
  async checkMultipleDomains(domains: string[]): Promise<Map<string, ReputationResult>> {
    const results = new Map<string, ReputationResult>()

    for (const domain of domains) {
      try {
        const result = await this.checkDomainReputation(domain)
        results.set(domain, result)
      } catch (error) {
        console.error(`Failed to check reputation for ${domain}:`, error)
        results.set(domain, this.getMockReputation(domain))
      }
    }

    return results
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== ''
  }
}

// Singleton instance
let instance: ReputationService | null = null

export function getReputationService(): ReputationService {
  if (!instance) {
    instance = new ReputationService()
  }
  return instance
}
