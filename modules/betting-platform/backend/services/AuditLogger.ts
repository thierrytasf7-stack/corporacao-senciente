import { PrismaClient } from '@prisma/client';

export class AuditLogger {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async log(userId: string, action: string, resource: string, metadata: Record<string, any> = {}) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          metadata: JSON.stringify(metadata),
          timestamp: new Date(),
          ip: metadata.ip || null,
          userAgent: metadata.userAgent || null
        }
      });
    } catch (error) {
      console.error('Audit log failed:', error);
      throw error;
    }
  }
}

/**
 * Database Schema for audit_logs table:
 * 
 * id: String (UUID) - Primary key
 * userId: String - User identifier
 * action: String - Action performed (e.g., 'CREATE_BET', 'UPDATE_PROFILE')
 * resource: String - Resource affected (e.g., 'bet', 'user')
 * metadata: Json - Additional context (IP, user agent, etc.)
 * timestamp: DateTime - When the action occurred
 * ip: String - Client IP address
 * userAgent: String - Browser/user agent string
 * createdAt: DateTime - Record creation timestamp
 * updatedAt: DateTime - Record update timestamp
 */