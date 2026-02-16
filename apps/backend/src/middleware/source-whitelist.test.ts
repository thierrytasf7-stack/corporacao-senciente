import { SourceWhitelistManager, getWhitelistManager } from './source-whitelist'
import * as fs from 'fs'
import * as path from 'path'

describe('SourceWhitelistManager', () => {
  let manager: SourceWhitelistManager
  const testConfigPath = path.join(process.cwd(), 'test-whitelist.json')

  beforeEach(() => {
    // Clean up test file
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath)
    }
    manager = new SourceWhitelistManager(testConfigPath)
  })

  afterEach(() => {
    // Clean up
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath)
    }
  })

  describe('Source Management', () => {
    it('should add a source to whitelist', () => {
      const source = manager.addSourceToWhitelist({
        id: 'test-001',
        name: 'Test Source',
        domain: 'example.com',
        category: 'test',
        status: 'active',
        reputation: {
          score: 8.0,
          lastChecked: new Date().toISOString(),
          trusted: true
        },
        tags: ['test'],
        description: 'Test description'
      })

      expect(source.name).toBe('Test Source')
      expect(source.domain).toBe('example.com')
      expect(manager.getWhitelist()).toHaveLength(1)
    })

    it('should retrieve whitelist', () => {
      manager.addSourceToWhitelist({
        id: 'test-001',
        name: 'Source 1',
        domain: 'source1.com',
        category: 'test',
        status: 'active',
        reputation: {
          score: 8.0,
          lastChecked: new Date().toISOString(),
          trusted: true
        },
        tags: [],
        description: ''
      })

      manager.addSourceToWhitelist({
        id: 'test-002',
        name: 'Source 2',
        domain: 'source2.com',
        category: 'test',
        status: 'active',
        reputation: {
          score: 7.5,
          lastChecked: new Date().toISOString(),
          trusted: true
        },
        tags: [],
        description: ''
      })

      const whitelist = manager.getWhitelist()
      expect(whitelist).toHaveLength(2)
      expect(whitelist.map((s) => s.domain)).toEqual(
        expect.arrayContaining(['source1.com', 'source2.com'])
      )
    })

    it('should block a source', () => {
      manager.addSourceToWhitelist({
        id: 'test-001',
        name: 'Test Source',
        domain: 'block-me.com',
        category: 'test',
        status: 'active',
        reputation: {
          score: 8.0,
          lastChecked: new Date().toISOString(),
          trusted: true
        },
        tags: [],
        description: ''
      })

      manager.blockSource('block-me.com', 'Malicious activity')
      expect(manager.getBlocklist()).toHaveLength(1)
      expect(manager.getWhitelist()).toHaveLength(0)
    })

    it('should check if source is allowed', () => {
      manager.addSourceToWhitelist({
        id: 'test-001',
        name: 'Allowed Source',
        domain: 'allowed.com',
        category: 'test',
        status: 'active',
        reputation: {
          score: 8.0,
          lastChecked: new Date().toISOString(),
          trusted: true
        },
        tags: [],
        description: ''
      })

      expect(manager.isSourceAllowed('allowed.com')).toBe(true)
      expect(manager.isSourceAllowed('notallowed.com')).toBe(false)
    })

    it('should handle domain normalization', () => {
      manager.addSourceToWhitelist({
        id: 'test-001',
        name: 'Test Source',
        domain: 'Example.COM',
        category: 'test',
        status: 'active',
        reputation: {
          score: 8.0,
          lastChecked: new Date().toISOString(),
          trusted: true
        },
        tags: [],
        description: ''
      })

      expect(manager.isSourceAllowed('example.com')).toBe(true)
      expect(manager.isSourceAllowed('EXAMPLE.COM')).toBe(true)
      expect(manager.isSourceAllowed('www.example.com')).toBe(true)
    })
  })

  describe('Pending Approval', () => {
    it('should add source to pending approval', () => {
      manager.addSourceToPendingApproval({
        id: 'test-001',
        name: 'Pending Source',
        domain: 'pending.com',
        category: 'test',
        status: 'inactive',
        reputation: {
          score: 5.0,
          lastChecked: new Date().toISOString(),
          trusted: false
        },
        tags: [],
        description: ''
      })

      const pending = manager.getPendingApproval()
      expect(pending).toHaveLength(1)
      expect(pending[0].name).toBe('Pending Source')
    })

    it('should approve a pending source', () => {
      manager.addSourceToPendingApproval({
        id: 'test-001',
        name: 'Pending Source',
        domain: 'pending.com',
        category: 'test',
        status: 'inactive',
        reputation: {
          score: 5.0,
          lastChecked: new Date().toISOString(),
          trusted: false
        },
        tags: [],
        description: ''
      })

      const pending = manager.getPendingApproval()
      const sourceId = pending[0].id

      const approved = manager.approveSource(sourceId)
      expect(approved).toBe(true)
      expect(manager.getPendingApproval()).toHaveLength(0)
      expect(manager.getWhitelist()).toHaveLength(1)
    })

    it('should reject a pending source', () => {
      manager.addSourceToPendingApproval({
        id: 'test-001',
        name: 'Pending Source',
        domain: 'pending.com',
        category: 'test',
        status: 'inactive',
        reputation: {
          score: 5.0,
          lastChecked: new Date().toISOString(),
          trusted: false
        },
        tags: [],
        description: ''
      })

      const pending = manager.getPendingApproval()
      const sourceId = pending[0].id

      const rejected = manager.rejectSource(sourceId)
      expect(rejected).toBe(true)
      expect(manager.getPendingApproval()).toHaveLength(0)
    })
  })

  describe('Audit Logging', () => {
    it('should log source access attempts', () => {
      manager.addSourceToWhitelist({
        id: 'test-001',
        name: 'Test Source',
        domain: 'logged.com',
        category: 'test',
        status: 'active',
        reputation: {
          score: 8.0,
          lastChecked: new Date().toISOString(),
          trusted: true
        },
        tags: [],
        description: ''
      })

      manager.isSourceAllowed('logged.com')
      manager.isSourceAllowed('blocked.com')

      const auditLog = manager.getAuditLog()
      expect(auditLog.length).toBeGreaterThan(0)
      expect(
        auditLog.some(
          (entry) => entry.domain === 'logged.com' && entry.result === 'allowed'
        )
      ).toBe(true)
      expect(
        auditLog.some(
          (entry) => entry.domain === 'blocked.com' && entry.result === 'blocked'
        )
      ).toBe(true)
    })
  })

  describe('Persistence', () => {
    it('should persist whitelist to file', () => {
      manager.addSourceToWhitelist({
        id: 'test-001',
        name: 'Test Source',
        domain: 'persist.com',
        category: 'test',
        status: 'active',
        reputation: {
          score: 8.0,
          lastChecked: new Date().toISOString(),
          trusted: true
        },
        tags: [],
        description: ''
      })

      // Load from file
      const newManager = new SourceWhitelistManager(testConfigPath)
      expect(newManager.getWhitelist()).toHaveLength(1)
      expect(newManager.getWhitelist()[0].domain).toBe('persist.com')
    })
  })
})
