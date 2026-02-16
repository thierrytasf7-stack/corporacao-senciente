import { Router, Request, Response } from 'express'
import { getWhitelistManager } from '../middleware/source-whitelist'
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../middleware/auth-middleware'

const router = Router()
const manager = getWhitelistManager()

interface WhitelistRequest extends Request {
  body: {
    name?: string
    domain?: string
    category?: string
    description?: string
    sourceId?: string
    reason?: string
    tags?: string[]
  }
}

/**
 * GET /api/whitelist - Get all whitelisted sources
 */
router.get('/', (req: WhitelistRequest, res: Response) => {
  try {
    const whitelist = manager.getWhitelist()
    res.json({
      success: true,
      data: whitelist,
      count: whitelist.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve whitelist'
    })
  }
})

/**
 * GET /api/whitelist/blocklist - Get all blocked sources
 */
router.get('/blocklist', (req: WhitelistRequest, res: Response) => {
  try {
    const blocklist = manager.getBlocklist()
    res.json({
      success: true,
      data: blocklist,
      count: blocklist.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve blocklist'
    })
  }
})

/**
 * GET /api/whitelist/pending - Get sources pending approval
 */
router.get('/pending', (req: WhitelistRequest, res: Response) => {
  try {
    const pending = manager.getPendingApproval()
    res.json({
      success: true,
      data: pending,
      count: pending.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve pending sources'
    })
  }
})

/**
 * GET /api/whitelist/audit - Get audit log
 */
router.get('/audit', (req: WhitelistRequest, res: Response) => {
  try {
    const auditLog = manager.getAuditLog()
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100
    const recent = auditLog.slice(-limit)

    res.json({
      success: true,
      data: recent,
      count: recent.length,
      total: auditLog.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit log'
    })
  }
})

/**
 * POST /api/whitelist - Add new source to whitelist
 * Requires: Admin authentication
 */
router.post('/', authMiddleware, requireAdmin, (req: WhitelistRequest, res: Response) => {
  try {
    const { name, domain, category, description, tags } = req.body

    if (!name || !domain || !category) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, domain, category'
      })
      return
    }

    const source = manager.addSourceToWhitelist({
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
    })

    res.status(201).json({
      success: true,
      data: source,
      message: 'Source added to whitelist'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add source to whitelist'
    })
  }
})

/**
 * POST /api/whitelist/request - Request to add source to whitelist (pending approval)
 */
router.post('/request', (req: WhitelistRequest, res: Response) => {
  try {
    const { name, domain, category, description, tags } = req.body

    if (!name || !domain || !category) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, domain, category'
      })
      return
    }

    manager.addSourceToPendingApproval({
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
    })

    res.status(202).json({
      success: true,
      message: 'Source request submitted for approval'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to submit source request'
    })
  }
})

/**
 * PATCH /api/whitelist/approve/:sourceId - Approve pending source
 * Requires: Admin authentication
 */
router.patch('/approve/:sourceId', authMiddleware, requireAdmin, (req: WhitelistRequest, res: Response) => {
  try {
    const { sourceId } = req.params

    const approved = manager.approveSource(sourceId)
    if (!approved) {
      res.status(404).json({
        success: false,
        error: 'Source not found in pending approvals'
      })
      return
    }

    res.json({
      success: true,
      message: 'Source approved and added to whitelist'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to approve source'
    })
  }
})

/**
 * PATCH /api/whitelist/reject/:sourceId - Reject pending source
 */
router.patch('/reject/:sourceId', (req: WhitelistRequest, res: Response) => {
  try {
    const { sourceId } = req.params

    const rejected = manager.rejectSource(sourceId)
    if (!rejected) {
      res.status(404).json({
        success: false,
        error: 'Source not found in pending approvals'
      })
      return
    }

    res.json({
      success: true,
      message: 'Source request rejected'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reject source'
    })
  }
})

/**
 * POST /api/whitelist/block - Block a source domain
 * Requires: Admin authentication
 */
router.post('/block', authMiddleware, requireAdmin, (req: WhitelistRequest, res: Response) => {
  try {
    const { domain, reason } = req.body

    if (!domain) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: domain'
      })
      return
    }

    manager.blockSource(domain, reason)

    res.json({
      success: true,
      message: `Domain ${domain} has been blocked`,
      domain
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to block source'
    })
  }
})

/**
 * GET /api/whitelist/check - Check if a domain is allowed
 */
router.get('/check', (req: WhitelistRequest, res: Response) => {
  try {
    const { domain } = req.query

    if (!domain) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: domain'
      })
      return
    }

    const isAllowed = manager.isSourceAllowed(domain as string)

    res.json({
      success: true,
      domain,
      allowed: isAllowed,
      status: isAllowed ? 'whitelisted' : 'blocked_or_unauthorized'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check domain'
    })
  }
})

/**
 * POST /api/whitelist/reputation/update - Manually trigger reputation check
 */
router.post('/reputation/update', async (req: WhitelistRequest, res: Response) => {
  try {
    await manager.updateReputationScores()
    res.json({
      success: true,
      message: 'Reputation scores updated successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update reputation scores'
    })
  }
})

export default router
