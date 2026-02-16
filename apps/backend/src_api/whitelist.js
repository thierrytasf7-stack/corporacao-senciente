/**
 * Source Whitelist API - JavaScript/Node.js Implementation
 * Gerencia whitelist de fontes de dados para scrapers
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WHITELIST_FILE = path.join(__dirname, '..', 'security', 'source_whitelist.json');

class SourceWhitelistManager {
  constructor() {
    this.config = null;
    this.loadWhitelist();
  }

  async loadWhitelist() {
    try {
      const data = await fs.readFile(WHITELIST_FILE, 'utf-8');
      this.config = JSON.parse(data);
    } catch (error) {
      // File doesn't exist - create with defaults
      this.config = this.getDefaultConfig();
      await this.saveWhitelist();
    }
  }

  getDefaultConfig() {
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
    };
  }

  async saveWhitelist() {
    try {
      const dir = path.dirname(WHITELIST_FILE);
      await fs.mkdir(dir, { recursive: true });

      this.config.lastUpdated = new Date().toISOString();
      await fs.writeFile(WHITELIST_FILE, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('[WHITELIST] Failed to save:', error);
    }
  }

  normalizeDomain(domain) {
    try {
      // Remove protocol
      domain = domain.replace(/^https?:\/\//, '');
      // Remove www.
      domain = domain.replace(/^www\./, '');
      // Remove path/query
      domain = domain.split('/')[0].split('?')[0];
      return domain.toLowerCase();
    } catch {
      return domain.toLowerCase();
    }
  }

  isSourceAllowed(domain) {
    if (!this.config) return false;

    const normalizedDomain = this.normalizeDomain(domain);

    // Check blocklist first
    const isBlocked = this.config.blocklist.some(
      (source) => this.normalizeDomain(source.domain) === normalizedDomain
    );

    if (isBlocked) {
      this.logAccess(domain, 'blocked', 'Domain is in blocklist');
      return false;
    }

    // Check whitelist
    const isWhitelisted = this.config.sources.some(
      (source) =>
        this.normalizeDomain(source.domain) === normalizedDomain &&
        source.status === 'active'
    );

    if (!isWhitelisted && this.config.policy.blockUnauthorized) {
      this.logAccess(domain, 'blocked', 'Domain not in whitelist');
      return false;
    }

    this.logAccess(domain, 'allowed');
    return true;
  }

  async addSourceToWhitelist(source) {
    if (!this.config) return source;

    const newSource = {
      ...source,
      addedBy: source.addedBy || 'system',
      addedAt: new Date().toISOString()
    };

    this.config.sources.push(newSource);
    await this.saveWhitelist();

    this.logAccess(source.domain, 'allowed', 'Source added to whitelist');
    return newSource;
  }

  async addSourceToPending(source) {
    if (!this.config) return;

    const newSource = {
      ...source,
      addedBy: 'user',
      addedAt: new Date().toISOString()
    };

    this.config.pendingApproval.push(newSource);
    await this.saveWhitelist();

    this.logAccess(source.domain, 'blocked', 'Source pending approval');
  }

  async blockSource(domain, reason = 'Blocked source') {
    if (!this.config) return;

    const normalizedDomain = this.normalizeDomain(domain);

    // Remove from whitelist
    this.config.sources = this.config.sources.filter(
      (s) => this.normalizeDomain(s.domain) !== normalizedDomain
    );

    // Check if already blocked
    const alreadyBlocked = this.config.blocklist.some(
      (s) => this.normalizeDomain(s.domain) === normalizedDomain
    );

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
        description: reason,
        addedBy: 'system',
        addedAt: new Date().toISOString()
      });
    }

    await this.saveWhitelist();
    this.logAccess(domain, 'blocked', reason);
  }

  async approveSource(sourceId) {
    if (!this.config) return false;

    const index = this.config.pendingApproval.findIndex((s) => s.id === sourceId);
    if (index === -1) return false;

    const source = this.config.pendingApproval.splice(index, 1)[0];
    source.status = 'active';
    source.addedBy = 'admin';

    this.config.sources.push(source);
    await this.saveWhitelist();

    this.logAccess(source.domain, 'allowed', 'Source approved');
    return true;
  }

  async rejectSource(sourceId) {
    if (!this.config) return false;

    const index = this.config.pendingApproval.findIndex((s) => s.id === sourceId);
    if (index === -1) return false;

    this.config.pendingApproval.splice(index, 1);
    await this.saveWhitelist();
    return true;
  }

  logAccess(domain, result, reason = null) {
    if (!this.config) return;

    this.config.auditLog.push({
      timestamp: new Date().toISOString(),
      event: `source_access_${result}`,
      domain,
      result,
      reason
    });

    // Keep only last 10000 entries
    if (this.config.auditLog.length > 10000) {
      this.config.auditLog = this.config.auditLog.slice(-10000);
    }

    // Save is async but don't await here to avoid blocking
    this.saveWhitelist().catch((err) => {
      console.error('[WHITELIST] Failed to save audit log:', err);
    });
  }

  getWhitelist() {
    return this.config?.sources || [];
  }

  getBlocklist() {
    return this.config?.blocklist || [];
  }

  getPendingApproval() {
    return this.config?.pendingApproval || [];
  }

  getAuditLog() {
    return this.config?.auditLog || [];
  }
}

// Singleton instance
const manager = new SourceWhitelistManager();

// Simple auth check (mock - replace with JWT in production)
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Missing or invalid authentication token'
    });
  }

  const token = authHeader.substring(7);
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid token'
    });
  }

  // In production, validate JWT here
  // For dev, accept any non-empty token
  next();
}

// ===== EXPORTED API FUNCTIONS =====

export async function getWhitelist(req, res) {
  try {
    const whitelist = manager.getWhitelist();
    res.json({
      success: true,
      data: whitelist,
      count: whitelist.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve whitelist'
    });
  }
}

export async function getBlocklist(req, res) {
  try {
    const blocklist = manager.getBlocklist();
    res.json({
      success: true,
      data: blocklist,
      count: blocklist.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve blocklist'
    });
  }
}

export async function getPendingApproval(req, res) {
  try {
    const pending = manager.getPendingApproval();
    res.json({
      success: true,
      data: pending,
      count: pending.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve pending sources'
    });
  }
}

export async function getAuditLog(req, res) {
  try {
    const auditLog = manager.getAuditLog();
    const limit = parseInt(req.query.limit) || 100;
    const recent = auditLog.slice(-limit);

    res.json({
      success: true,
      data: recent,
      count: recent.length,
      total: auditLog.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit log'
    });
  }
}

export async function checkDomain(req, res) {
  try {
    const { domain } = req.query;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: domain'
      });
    }

    const isAllowed = manager.isSourceAllowed(domain);

    res.json({
      success: true,
      domain,
      allowed: isAllowed,
      status: isAllowed ? 'whitelisted' : 'blocked_or_unauthorized'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check domain'
    });
  }
}

export async function addSource(req, res) {
  // Auth check
  const authResult = requireAuth(req, res, () => {});
  if (authResult) return;

  try {
    const { name, domain, category, description, tags } = req.body;

    if (!name || !domain || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, domain, category'
      });
    }

    const source = await manager.addSourceToWhitelist({
      id: `source-${Date.now()}`,
      name,
      domain,
      category,
      status: 'active',
      reputation: {
        score: 5.0,
        lastChecked: new Date().toISOString(),
        trusted: false
      },
      tags: tags || [],
      description: description || ''
    });

    res.status(201).json({
      success: true,
      data: source,
      message: 'Source added to whitelist'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to add source to whitelist: ${error.message}`
    });
  }
}

export async function requestSource(req, res) {
  try {
    const { name, domain, category, description, tags } = req.body;

    if (!name || !domain || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, domain, category'
      });
    }

    await manager.addSourceToPending({
      id: `source-${Date.now()}`,
      name,
      domain,
      category,
      status: 'inactive',
      reputation: {
        score: 5.0,
        lastChecked: new Date().toISOString(),
        trusted: false
      },
      tags: tags || [],
      description: description || ''
    });

    res.status(202).json({
      success: true,
      message: 'Source request submitted for approval'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to submit source request: ${error.message}`
    });
  }
}

export async function approveSource(req, res) {
  // Auth check
  const authResult = requireAuth(req, res, () => {});
  if (authResult) return;

  try {
    const { sourceId } = req.params;

    const approved = await manager.approveSource(sourceId);
    if (!approved) {
      return res.status(404).json({
        success: false,
        error: 'Source not found in pending approvals'
      });
    }

    res.json({
      success: true,
      message: 'Source approved and added to whitelist'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to approve source: ${error.message}`
    });
  }
}

export async function rejectSource(req, res) {
  // Auth check
  const authResult = requireAuth(req, res, () => {});
  if (authResult) return;

  try {
    const { sourceId } = req.params;

    const rejected = await manager.rejectSource(sourceId);
    if (!rejected) {
      return res.status(404).json({
        success: false,
        error: 'Source not found in pending approvals'
      });
    }

    res.json({
      success: true,
      message: 'Source request rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to reject source: ${error.message}`
    });
  }
}

export async function blockSource(req, res) {
  // Auth check
  const authResult = requireAuth(req, res, () => {});
  if (authResult) return;

  try {
    const { domain, reason } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: domain'
      });
    }

    await manager.blockSource(domain, reason);

    res.json({
      success: true,
      message: `Domain ${domain} has been blocked`,
      domain
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to block source: ${error.message}`
    });
  }
}

export async function updateReputation(req, res) {
  // Auth check
  const authResult = requireAuth(req, res, () => {});
  if (authResult) return;

  try {
    // In production, integrate with VirusTotal/AbuseIPDB
    // For now, mock implementation
    res.json({
      success: true,
      message: 'Reputation update triggered (mock implementation)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to update reputation: ${error.message}`
    });
  }
}

// Export manager for use in middleware
export { manager };
