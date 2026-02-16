import * as fs from 'fs'
import * as path from 'path'

interface WhitelistSource {
  id: string
  name: string
  domain: string
  category: string
  status: 'active' | 'inactive' | 'suspended'
  reputation: {
    score: number
    lastChecked: string
    trusted: boolean
  }
  tags: string[]
  description: string
  addedBy: string
  addedAt: string
}

interface WhitelistConfig {
  version: string
  lastUpdated: string
  policy: {
    blockUnauthorized: boolean
    logBlocked: boolean
    validateReputation: boolean
    reputationCheckInterval: number
  }
  sources: WhitelistSource[]
  blocklist: WhitelistSource[]
  pendingApproval: WhitelistSource[]
  auditLog: Array<{
    timestamp: string
    event: string
    domain: string
    result: 'allowed' | 'blocked'
    reason?: string
  }>
}

export class SourceWhitelistManager {
  private configPath: string
  private config: WhitelistConfig | null = null
  private reputationCheckInterval: NodeJS.Timer | null = null

  constructor(configPath?: string) {
    this.configPath =
      configPath ||
      path.join(
        process.cwd(),
        'security',
        'source_whitelist.json'
      )
    this.loadWhitelist()
  }

  private loadWhitelist(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8')
        this.config = JSON.parse(data)
      } else {
        this.config = this.getDefaultConfig()
        this.saveWhitelist()
      }
    } catch (error) {
      console.error('Failed to load whitelist:', error)
      this.config = this.getDefaultConfig()
    }
  }

  private getDefaultConfig(): WhitelistConfig {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      policy: {
        blockUnauthorized: true,
        logBlocked: true,
        validateReputation: true,
        reputationCheckInterval: 604800000
      },
      sources: [],
      blocklist: [],
      pendingApproval: [],
      auditLog: []
    }
  }

  private saveWhitelist(): void {
    try {
      const dir = path.dirname(this.configPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      this.config!.lastUpdated = new Date().toISOString()
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(this.config, null, 2)
      )
    } catch (error) {
      console.error('Failed to save whitelist:', error)
    }
  }

  public isSourceAllowed(domain: string): boolean {
    if (!this.config) return false

    const normalizedDomain = this.normalizeDomain(domain)

    // Check blocklist first
    const isBlocked = this.config.blocklist.some(
      (source) =>
        this.normalizeDomain(source.domain) === normalizedDomain
    )

    if (isBlocked) {
      this.logAccess(domain, 'blocked', 'Domain is in blocklist')
      return false
    }

    // Check whitelist
    const isWhitelisted = this.config.sources.some(
      (source) =>
        this.normalizeDomain(source.domain) === normalizedDomain &&
        source.status === 'active'
    )

    if (!isWhitelisted && this.config.policy.blockUnauthorized) {
      this.logAccess(domain, 'blocked', 'Domain not in whitelist')
      return false
    }

    this.logAccess(domain, 'allowed')
    return true
  }

  public addSourceToWhitelist(source: Omit<WhitelistSource, 'addedBy' | 'addedAt'>): WhitelistSource {
    if (!this.config) return source as WhitelistSource

    const newSource: WhitelistSource = {
      ...source,
      addedBy: 'system',
      addedAt: new Date().toISOString()
    }

    this.config.sources.push(newSource)
    this.saveWhitelist()

    this.logAccess(source.domain, 'allowed', 'Source added to whitelist')
    return newSource
  }

  public addSourceToPendingApproval(source: Omit<WhitelistSource, 'addedBy' | 'addedAt'>): void {
    if (!this.config) return

    const newSource: WhitelistSource = {
      ...source,
      addedBy: 'user',
      addedAt: new Date().toISOString()
    }

    this.config.pendingApproval.push(newSource)
    this.saveWhitelist()

    this.logAccess(source.domain, 'blocked', 'Source pending approval')
  }

  public blockSource(domain: string, reason?: string): void {
    if (!this.config) return

    const normalizedDomain = this.normalizeDomain(domain)

    // Remove from whitelist if exists
    this.config.sources = this.config.sources.filter(
      (source) => this.normalizeDomain(source.domain) !== normalizedDomain
    )

    // Add to blocklist if not already there
    const alreadyBlocked = this.config.blocklist.some(
      (source) => this.normalizeDomain(source.domain) === normalizedDomain
    )

    if (!alreadyBlocked) {
      this.config.blocklist.push({
        id: `blocked-${Date.now()}`,
        name: domain,
        domain,
        category: 'blocked',
        status: 'suspended',
        reputation: {
          score: 0,
          lastChecked: new Date().toISOString(),
          trusted: false
        },
        tags: ['blocked'],
        description: reason || 'Blocked source',
        addedBy: 'system',
        addedAt: new Date().toISOString()
      })
    }

    this.saveWhitelist()
    this.logAccess(domain, 'blocked', reason || 'Source blocked')
  }

  public getWhitelist(): WhitelistSource[] {
    return this.config?.sources || []
  }

  public getBlocklist(): WhitelistSource[] {
    return this.config?.blocklist || []
  }

  public getPendingApproval(): WhitelistSource[] {
    return this.config?.pendingApproval || []
  }

  public getAuditLog(): Array<any> {
    return this.config?.auditLog || []
  }

  public approveSource(sourceId: string): boolean {
    if (!this.config) return false

    const index = this.config.pendingApproval.findIndex(
      (source) => source.id === sourceId
    )

    if (index === -1) return false

    const source = this.config.pendingApproval.splice(index, 1)[0]
    this.config.sources.push({
      ...source,
      status: 'active',
      addedBy: 'admin'
    })

    this.saveWhitelist()
    this.logAccess(source.domain, 'allowed', 'Source approved')
    return true
  }

  public rejectSource(sourceId: string): boolean {
    if (!this.config) return false

    const index = this.config.pendingApproval.findIndex(
      (source) => source.id === sourceId
    )

    if (index === -1) return false

    this.config.pendingApproval.splice(index, 1)
    this.saveWhitelist()
    return true
  }

  private logAccess(
    domain: string,
    result: 'allowed' | 'blocked',
    reason?: string
  ): void {
    if (!this.config) return

    this.config.auditLog.push({
      timestamp: new Date().toISOString(),
      event: `source_access_${result}`,
      domain,
      result,
      reason
    })

    // Keep only last 10000 entries
    if (this.config.auditLog.length > 10000) {
      this.config.auditLog = this.config.auditLog.slice(-10000)
    }

    this.saveWhitelist()
  }

  private normalizeDomain(domain: string): string {
    try {
      const url = new URL(`http://${domain}`)
      return url.hostname.toLowerCase()
    } catch {
      return domain.toLowerCase()
    }
  }

  public async checkReputationAsync(domain: string): Promise<number> {
    // Try to use external reputation service
    try {
      const { getReputationService } = await import('../services/reputation-service')
      const reputationService = getReputationService()
      const result = await reputationService.checkDomainReputation(domain)
      return result.score
    } catch (error) {
      console.error('Failed to check reputation via external service:', error)

      // Fallback: check existing score or return default
      const normalizedDomain = this.normalizeDomain(domain)
      const source = this.config?.sources.find(
        (s) => this.normalizeDomain(s.domain) === normalizedDomain
      )

      return source?.reputation.score ?? 3.0
    }
  }

  public async updateReputationScores(): Promise<void> {
    if (!this.config) return

    console.log(`[WHITELIST] Updating reputation scores for ${this.config.sources.length} sources...`)

    // Update scores using external reputation service
    for (const source of this.config.sources) {
      try {
        const score = await this.checkReputationAsync(source.domain)
        source.reputation.score = score
        source.reputation.lastChecked = new Date().toISOString()
        source.reputation.trusted = score >= 7.0

        console.log(
          `[WHITELIST] ${source.domain}: score ${score.toFixed(1)} (${source.reputation.trusted ? 'TRUSTED' : 'NOT TRUSTED'})`
        )
      } catch (error) {
        console.error(`[WHITELIST] Failed to update reputation for ${source.domain}:`, error)
      }
    }

    this.saveWhitelist()
    console.log('[WHITELIST] Reputation scores updated successfully')
  }

  public startReputationCheckScheduler(): void {
    if (this.reputationCheckInterval) return

    const interval = this.config?.policy.reputationCheckInterval || 604800000
    this.reputationCheckInterval = setInterval(() => {
      this.updateReputationScores().catch((error) => {
        console.error('Reputation check failed:', error)
      })
    }, interval)
  }

  public stopReputationCheckScheduler(): void {
    if (this.reputationCheckInterval) {
      clearInterval(this.reputationCheckInterval)
      this.reputationCheckInterval = null
    }
  }
}

// Singleton instance
let instance: SourceWhitelistManager | null = null

export function getWhitelistManager(): SourceWhitelistManager {
  if (!instance) {
    instance = new SourceWhitelistManager()
  }
  return instance
}
