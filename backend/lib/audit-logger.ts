import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

interface AuditLogData {
  userId: string;
  action: string;
  resource?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async log(data: AuditLogData): Promise<void> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.userActivity.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: data.resource || null,
          metadata: data.metadata || {},
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          timestamp: new Date()
        }
      });

      await prisma.$disconnect();
    } catch (error) {
      console.error('Failed to log audit activity:', error);
    }
  }

  static async logFromRequest(
    request: NextRequest,
    action: string,
    resource?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const session = await getServerSession();
      
      if (session?.user?.id) {
        await this.log({
          userId: session.user.id,
          action,
          resource,
          metadata,
          ipAddress: request.ip || 
                    request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        });
      }
    } catch (error) {
      console.error('Failed to log audit activity from request:', error);
    }
  }

  static async logLogin(
    userId: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: success ? 'LOGIN' : 'FAILED_LOGIN',
      resource: 'auth',
      metadata: { success },
      ipAddress,
      userAgent
    });
  }

  static async logLogout(userId: string): Promise<void> {
    await this.log({
      userId,
      action: 'LOGOUT',
      resource: 'auth'
    });
  }

  static async logApiCall(
    userId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      action: 'API_CALL',
      resource: `${method} ${endpoint}`,
      metadata: {
        statusCode,
        ...metadata
      }
    });
  }

  static async logDataAccess(
    userId: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      action: 'DATA_ACCESS',
      resource: resourceId ? `${resource}/${resourceId}` : resource,
      metadata
    });
  }

  static async logDataModification(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: resourceId ? `${resource}/${resourceId}` : resource,
      metadata
    });
  }

  static async logSecurityEvent(
    userId: string,
    event: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      action: 'SECURITY_EVENT',
      resource: event,
      metadata
    });
  }
}

// Common actions for audit logging
export const AuditActions = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  FAILED_LOGIN: 'FAILED_LOGIN',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  MFA_ENABLED: 'MFA_ENABLED',
  MFA_DISABLED: 'MFA_DISABLED',
  API_CALL: 'API_CALL',
  DATA_ACCESS: 'DATA_ACCESS',
  DATA_EXPORT: 'DATA_EXPORT',
  DATA_DELETE: 'DATA_DELETE',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  REPORT_GENERATED: 'REPORT_GENERATED',
  REPORT_ACCESSED: 'REPORT_ACCESSED',
  SECURITY_EVENT: 'SECURITY_EVENT',
  SSO_LOGIN: 'SSO_LOGIN',
  BIOMETRIC_LOGIN: 'BIOMETRIC_LOGIN',
  HARDWARE_KEY_LOGIN: 'HARDWARE_KEY_LOGIN'
} as const;