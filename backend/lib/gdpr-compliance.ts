import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface GDPRRequest {
  id: string;
  userId: string;
  type: 'export' | 'delete' | 'opt-out' | 'restrict-processing';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestDate: Date;
  completedDate?: Date;
  processedBy?: string;
  metadata?: Record<string, any>;
}

export interface UserDataExport {
  user: {
    id: string;
    email: string;
    name?: string;
    createdAt: Date;
    lastLoginAt?: Date;
  };
  activities: Array<{
    action: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  preferences: Record<string, any>;
  organizations: Array<{
    name: string;
    role: string;
    joinedAt: Date;
  }>;
  devices: Array<{
    name: string;
    type: string;
    createdAt: Date;
  }>;
  reports: Array<{
    name: string;
    type: string;
    createdAt: Date;
  }>;
}

export class GDPRComplianceService {
  
  // Create a new GDPR data request
  static async createDataRequest(
    userId: string, 
    type: GDPRRequest['type']
  ): Promise<GDPRRequest> {
    const request = await prisma.gDPRDataRequest.create({
      data: {
        userId,
        type,
        status: 'pending',
        requestDate: new Date(),
      },
    });

    return {
      id: request.id,
      userId: request.userId,
      type: request.type as GDPRRequest['type'],
      status: request.status as GDPRRequest['status'],
      requestDate: request.requestDate,
      completedDate: request.completedDate || undefined,
      processedBy: request.processedBy || undefined,
      metadata: request.metadata as Record<string, any> || undefined,
    };
  }

  // Export all user data (Right to Data Portability)
  static async exportUserData(userId: string): Promise<UserDataExport> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        activities: {
          orderBy: { timestamp: 'desc' },
          take: 1000, // Limit last 1000 activities
        },
        preferences: true,
        organization: {
          include: {
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
        authenticatorDevices: true,
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 100, // Limit last 100 reports
        },
        searches: {
          orderBy: { createdAt: 'desc' },
          take: 100, // Limit last 100 searches
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt || undefined,
      },
      activities: user.activities.map(activity => ({
        action: activity.action,
        timestamp: activity.timestamp,
        metadata: activity.metadata as Record<string, any> || undefined,
      })),
      preferences: user.preferences ? {
        theme: user.preferences.theme,
        emailNotifications: user.preferences.emailNotifications,
        pushNotifications: user.preferences.pushNotifications,
        weeklyDigest: user.preferences.weeklyDigest,
        favoriteIndustries: user.preferences.favoriteIndustries,
        favoriteCompanies: user.preferences.favoriteCompanies,
        customSettings: user.preferences.customSettings as Record<string, any> || undefined,
      } : {},
      organizations: user.organization.map(org => ({
        name: org.organization.name,
        role: org.role || 'member',
        joinedAt: org.createdAt,
      })),
      devices: user.authenticatorDevices.map(device => ({
        name: device.name || 'Unknown Device',
        type: device.transports?.includes('usb') ? 'hardware' : 'biometric',
        createdAt: device.createdAt,
      })),
      reports: user.reports.map(report => ({
        name: report.name,
        type: report.type,
        createdAt: report.createdAt,
      })),
    };
  }

  // Delete user data (Right to be Forgotten)
  static async deleteUserData(userId: string, processedBy: string): Promise<void> {
    // Start atomic transaction
    await prisma.$transaction(async (tx) => {
      
      // Delete user-related data in order of dependencies
      await tx.auditLog.deleteMany({
        where: { userId },
      });

      await tx.securityEvent.deleteMany({
        where: { userId },
      });

      await tx.apiKey.deleteMany({
        where: { userId },
      });

      await tx.alert.deleteMany({
        where: { userId },
      });

      await tx.dashboard.deleteMany({
        where: { userId },
      });

      await tx.report.deleteMany({
        where: { userId },
      });

      await tx.savedSearch.deleteMany({
        where: { userId },
      });

      await tx.userActivity.deleteMany({
        where: { userId },
      });

      await tx.authenticatorDevice.deleteMany({
        where: { userId },
      });

      await tx.magicLink.deleteMany({
        where: { email: (await tx.user.findUnique({ where: { id: userId } }))?.email },
      });

      await tx.userPreferences.deleteMany({
        where: { userId },
      });

      await tx.teamMember.deleteMany({
        where: { userId },
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId },
      });

    });

    // Update GDPR request status
    await prisma.gDPRDataRequest.updateMany({
      where: {
        userId,
        type: 'delete',
        status: 'pending',
      },
      data: {
        status: 'completed',
        completedDate: new Date(),
        processedBy,
        metadata: {
          deletionProof: {
            timestamp: new Date().toISOString(),
            processedBy,
            deletionType: 'full_data_erasure',
          },
        },
      },
    });
  }

  // Opt-out of data processing
  static async optOutProcessing(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        // Add opt-out flag (you'll need to add this to the schema)
        // For now, we'll mark it in preferences
        preferences: {
          upsert: {
            create: {
              dataProcessingOptOut: true,
              theme: 'light',
              emailNotifications: false,
              pushNotifications: false,
              weeklyDigest: false,
            },
            update: {
              dataProcessingOptOut: true,
            },
          },
        },
      },
    });

    // Log the opt-out
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'GDPR_OPT_OUT',
        resource: 'data_processing',
        metadata: {
          timestamp: new Date().toISOString(),
          type: 'right_to_object',
        },
        timestamp: new Date(),
      },
    });
  }

  // Get all GDPR requests for admin
  static async getGDPRRequests(): Promise<GDPRRequest[]> {
    const requests = await prisma.gDPRDataRequest.findMany({
      orderBy: { requestDate: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    return requests.map(request => ({
      id: request.id,
      userId: request.userId,
      type: request.type as GDPRRequest['type'],
      status: request.status as GDPRRequest['status'],
      requestDate: request.requestDate,
      completedDate: request.completedDate || undefined,
      processedBy: request.processedBy || undefined,
      metadata: request.metadata as Record<string, any> || undefined,
    }));
  }

  // Process GDPR request
  static async processGDPRRequest(
    requestId: string, 
    processedBy: string
  ): Promise<void> {
    const request = await prisma.gDPRDataRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new Error('GDPR request not found');
    }

    // Update status to processing
    await prisma.gDPRDataRequest.update({
      where: { id: requestId },
      data: {
        status: 'processing',
        processedBy,
      },
    });

    try {
      switch (request.type) {
        case 'export':
          const userData = await this.exportUserData(request.userId);
          // Here you would typically store the export data and provide a download URL
          await prisma.gDPRDataRequest.update({
            where: { id: requestId },
            data: {
              status: 'completed',
              completedDate: new Date(),
              metadata: {
                exportData: userData,
                exportUrl: `/api/admin/compliance/export/${requestId}`,
              },
            },
          });
          break;

        case 'delete':
          await this.deleteUserData(request.userId, processedBy);
          break;

        case 'opt-out':
          await this.optOutProcessing(request.userId);
          await prisma.gDPRDataRequest.update({
            where: { id: requestId },
            data: {
              status: 'completed',
              completedDate: new Date(),
            },
          });
          break;

        default:
          throw new Error(`Unsupported GDPR request type: ${request.type}`);
      }
    } catch (error) {
      // Update status to failed
      await prisma.gDPRDataRequest.update({
        where: { id: requestId },
        data: {
          status: 'failed',
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      });
      throw error;
    }
  }

  // Generate data retention report
  static async generateRetentionReport(): Promise<{
    totalUsers: number;
    dataOlderThan1Year: number;
    dataOlderThan2Years: number;
    dataOlderThan5Years: number;
    recommendedActions: string[];
  }> {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
    const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());

    const [
      totalUsers,
      usersOlderThan1Year,
      usersOlderThan2Years,
      usersOlderThan5Years,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: { lt: oneYearAgo },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { lt: twoYearsAgo },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { lt: fiveYearsAgo },
        },
      }),
    ]);

    const recommendedActions = [];
    
    if (usersOlderThan5Years > 0) {
      recommendedActions.push('Consider anonymizing or deleting user data older than 5 years');
    }
    
    if (usersOlderThan2Years > totalUsers * 0.1) {
      recommendedActions.push('Large amount of inactive data - implement data retention policy');
    }

    return {
      totalUsers,
      dataOlderThan1Year: usersOlderThan1Year,
      dataOlderThan2Years: usersOlderThan2Years,
      dataOlderThan5Years: usersOlderThan5Years,
      recommendedActions,
    };
  }

  // Cleanup old data (automated data retention)
  static async cleanupOldData(retentionPolicy: {
    activities?: number; // days
    auditLogs?: number; // days
    magicLinks?: number; // days
  }): Promise<{
    deletedActivities: number;
    deletedAuditLogs: number;
    deletedMagicLinks: number;
  }> {
    const now = new Date();
    
    const [
      deletedActivities,
      deletedAuditLogs,
      deletedMagicLinks,
    ] = await Promise.all([
      retentionPolicy.activities
        ? prisma.userActivity.deleteMany({
            where: {
              timestamp: {
                lt: new Date(now.getTime() - retentionPolicy.activities * 24 * 60 * 60 * 1000),
              },
            },
          }).then(result => result.count)
        : 0,
        
      retentionPolicy.auditLogs
        ? prisma.auditLog.deleteMany({
            where: {
              timestamp: {
                lt: new Date(now.getTime() - retentionPolicy.auditLogs * 24 * 60 * 60 * 1000),
              },
            },
          }).then(result => result.count)
        : 0,
        
      retentionPolicy.magicLinks
        ? prisma.magicLink.deleteMany({
            where: {
              expiresAt: {
                lt: new Date(now.getTime() - retentionPolicy.magicLinks * 24 * 60 * 60 * 1000),
              },
            },
          }).then(result => result.count)
        : 0,
    ]);

    return {
      deletedActivities,
      deletedAuditLogs,
      deletedMagicLinks,
    };
  }
}

// Helper function to generate deletion proof
export function generateDeletionProof(userId: string, processedBy: string): {
  proofId: string;
  timestamp: string;
  processedBy: string;
  userId: string;
  signature: string;
} {
  const proofId = `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  // In a real implementation, you would use cryptographic signing
  const signature = Buffer.from(`${proofId}:${timestamp}:${userId}:${processedBy}`).toString('base64');
  
  return {
    proofId,
    timestamp,
    processedBy,
    userId,
    signature,
  };
}