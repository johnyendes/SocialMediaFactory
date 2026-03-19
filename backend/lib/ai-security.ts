import { AuditLogger } from './audit-logger';

export interface SecurityEvent {
  id: string;
  userId: string;
  type: 'anomaly' | 'threat' | 'suspicious' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  riskScore: number; // 0-100
  indicators: string[];
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface AnomalyDetectionRule {
  id: string;
  name: string;
  type: 'behavioral' | 'temporal' | 'geographic' | 'frequency' | 'pattern';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  threshold?: number;
  timeWindow?: number; // minutes
}

export class AISecurityMonitor {
  private static readonly RULES: AnomalyDetectionRule[] = [
    {
      id: 'login_burst',
      name: 'Unusual Login Burst',
      type: 'frequency',
      description: 'Multiple login attempts in short time period',
      severity: 'medium',
      enabled: true,
      threshold: 5,
      timeWindow: 5,
    },
    {
      id: 'failed_login_spike',
      name: 'Failed Login Spike',
      type: 'frequency',
      description: 'High number of failed login attempts',
      severity: 'high',
      enabled: true,
      threshold: 10,
      timeWindow: 10,
    },
    {
      id: 'impossible_travel',
      name: 'Impossible Travel',
      type: 'geographic',
      description: 'Login from geographically impossible locations',
      severity: 'high',
      enabled: true,
      threshold: 1000, // km
      timeWindow: 60,
    },
    {
      id: 'off_hours_access',
      name: 'Off Hours Access',
      type: 'temporal',
      description: 'Access during unusual hours',
      severity: 'medium',
      enabled: true,
      threshold: 2, // hours outside normal (9-5)
    },
    {
      id: 'new_device_pattern',
      name: 'New Device Pattern',
      type: 'behavioral',
      description: 'Login from multiple new devices',
      severity: 'medium',
      enabled: true,
      threshold: 3,
      timeWindow: 24 * 60, // 24 hours
    },
    {
      id: 'privilege_escalation',
      name: 'Privilege Escalation',
      type: 'behavioral',
      description: 'Unusual role or permission changes',
      severity: 'critical',
      enabled: true,
    },
    {
      id: 'api_abuse',
      name: 'API Abuse',
      type: 'frequency',
      description: 'Excessive API calls suggesting automation/abuse',
      severity: 'high',
      enabled: true,
      threshold: 1000,
      timeWindow: 60,
    },
    {
      id: 'data_exfiltration',
      name: 'Data Exfiltration Pattern',
      type: 'behavioral',
      description: 'Unusual data download patterns',
      severity: 'critical',
      enabled: true,
      threshold: 100, // MB
      timeWindow: 30,
    },
  ];

  // Analyze user behavior for anomalies
  static async analyzeUserActivity(userId: string): Promise<SecurityEvent[]> {
    const events: SecurityEvent[] = [];
    
    for (const rule of this.RULES.filter(r => r.enabled)) {
      try {
        const event = await this.evaluateRule(rule, userId);
        if (event) {
          events.push(event);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    }

    return events;
  }

  // Evaluate individual security rule
  private static async evaluateRule(rule: AnomalyDetectionRule, userId: string): Promise<SecurityEvent | null> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      let event: SecurityEvent | null = null;

      switch (rule.id) {
        case 'login_burst':
          event = await this.detectLoginBurst(prisma, userId, rule);
          break;
        case 'failed_login_spike':
          event = await this.detectFailedLoginSpike(prisma, userId, rule);
          break;
        case 'impossible_travel':
          event = await this.detectImpossibleTravel(prisma, userId, rule);
          break;
        case 'off_hours_access':
          event = await this.detectOffHoursAccess(prisma, userId, rule);
          break;
        case 'new_device_pattern':
          event = await this.detectNewDevicePattern(prisma, userId, rule);
          break;
        case 'privilege_escalation':
          event = await this.detectPrivilegeEscalation(prisma, userId, rule);
          break;
        case 'api_abuse':
          event = await this.detectAPIAbuse(prisma, userId, rule);
          break;
        case 'data_exfiltration':
          event = await this.detectDataExfiltration(prisma, userId, rule);
          break;
      }

      return event;
    } finally {
      await prisma.$disconnect();
    }
  }

  // Detect login burst anomaly
  private static async detectLoginBurst(prisma: any, userId: string, rule: AnomalyDetectionRule): Promise<SecurityEvent | null> {
    const timeWindow = new Date(Date.now() - (rule.timeWindow! * 60 * 1000));
    
    const loginCount = await prisma.userActivity.count({
      where: {
        userId,
        action: 'LOGIN',
        timestamp: {
          gte: timeWindow,
        },
      },
    });

    if (loginCount > rule.threshold!) {
      return {
        id: `burst_${userId}_${Date.now()}`,
        userId,
        type: 'anomaly',
        severity: rule.severity,
        title: 'Unusual Login Activity Detected',
        description: `User has logged in ${loginCount} times in the last ${rule.timeWindow} minutes (threshold: ${rule.threshold})`,
        riskScore: Math.min(90, 50 + (loginCount - rule.threshold!) * 10),
        indicators: ['frequency', 'behavioral'],
        timestamp: new Date(),
        metadata: { loginCount, threshold: rule.threshold, timeWindow: rule.timeWindow },
      };
    }

    return null;
  }

  // Detect failed login spike
  private static async detectFailedLoginSpike(prisma: any, userId: string, rule: AnomalyDetectionRule): Promise<SecurityEvent | null> {
    const timeWindow = new Date(Date.now() - (rule.timeWindow! * 60 * 1000));
    
    const failedLogins = await prisma.userActivity.count({
      where: {
        action: 'FAILED_LOGIN',
        metadata: {
          path: ['email'],
          equals: (await prisma.user.findUnique({ where: { id: userId } }))?.email,
        },
        timestamp: {
          gte: timeWindow,
        },
      },
    });

    if (failedLogins > rule.threshold!) {
      return {
        id: `failed_spike_${userId}_${Date.now()}`,
        userId,
        type: 'threat',
        severity: rule.severity,
        title: 'Failed Login Attack Detected',
        description: `${failedLogins} failed login attempts detected for this user in ${rule.timeWindow} minutes`,
        riskScore: Math.min(95, 60 + (failedLogins - rule.threshold!) * 8),
        indicators: ['brute_force', 'credential_stuffing'],
        timestamp: new Date(),
        metadata: { failedLogins, threshold: rule.threshold },
      };
    }

    return null;
  }

  // Detect impossible travel (simplified version)
  private static async detectImpossibleTravel(prisma: any, userId: string, rule: AnomalyDetectionRule): Promise<SecurityEvent | null> {
    const recentLogins = await prisma.userActivity.findMany({
      where: {
        userId,
        action: 'LOGIN',
        timestamp: {
          gte: new Date(Date.now() - (rule.timeWindow! * 60 * 1000)),
        },
        ipAddress: {
          not: null,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 2,
    });

    if (recentLogins.length === 2) {
      const [current, previous] = recentLogins;
      const timeDiff = current.timestamp.getTime() - previous.timestamp.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Simplified geo-location check (would use actual IP geolocation in production)
      const distance = this.estimateDistance(previous.ipAddress!, current.ipAddress!);
      const requiredSpeed = distance / hoursDiff;

      // If required speed > 800 km/h (commercial aircraft speed), flag as impossible
      if (requiredSpeed > rule.threshold!) {
        return {
          id: `impossible_travel_${userId}_${Date.now()}`,
          userId,
          type: 'threat',
          severity: rule.severity,
          title: 'Impossible Travel Detected',
          description: `Login detected from location that would require travel at ${requiredSpeed.toFixed(0)} km/h`,
          riskScore: 85,
          indicators: ['geographic', 'impossible_travel'],
          timestamp: new Date(),
          ipAddress: current.ipAddress || undefined,
          metadata: { 
            previousIP: previous.ipAddress, 
            currentIP: current.ipAddress,
            requiredSpeed,
            timeDifference: hoursDiff
          },
        };
      }
    }

    return null;
  }

  // Detect off-hours access
  private static async detectOffHoursAccess(prisma: any, userId: string, rule: AnomalyDetectionRule): Promise<SecurityEvent | null> {
    const recentActivity = await prisma.userActivity.findMany({
      where: {
        userId,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 10,
    });

    const offHoursCount = recentActivity.filter(activity => {
      const hour = activity.timestamp.getHours();
      return hour < 7 || hour > 19; // Outside 7 AM - 7 PM
    }).length;

    if (offHoursCount > rule.threshold!) {
      return {
        id: `off_hours_${userId}_${Date.now()}`,
        userId,
        type: 'suspicious',
        severity: rule.severity,
        title: 'Off-Hours Activity Detected',
        description: `${offHoursCount} activities detected outside normal business hours`,
        riskScore: 60 + offHoursCount * 5,
        indicators: ['temporal', 'behavioral'],
        timestamp: new Date(),
        metadata: { offHoursCount, totalActivities: recentActivity.length },
      };
    }

    return null;
  }

  // Detect new device pattern
  private static async detectNewDevicePattern(prisma: any, userId: string, rule: AnomalyDetectionRule): Promise<SecurityEvent | null> {
    const timeWindow = new Date(Date.now() - (rule.timeWindow! * 60 * 1000));
    
    const uniqueDevices = await prisma.userActivity.groupBy({
      by: ['userAgent'],
      where: {
        userId,
        timestamp: {
          gte: timeWindow,
        },
        userAgent: {
          not: null,
        },
      },
      _count: true,
    });

    if (uniqueDevices.length > rule.threshold!) {
      return {
        id: `new_devices_${userId}_${Date.now()}`,
        userId,
        type: 'suspicious',
        severity: rule.severity,
        title: 'Multiple New Devices Detected',
        description: `Access from ${uniqueDevices.length} different devices detected`,
        riskScore: 65 + uniqueDevices.length * 3,
        indicators: ['device', 'behavioral'],
        timestamp: new Date(),
        metadata: { deviceCount: uniqueDevices.length, devices: uniqueDevices },
      };
    }

    return null;
  }

  // Detect privilege escalation
  private static async detectPrivilegeEscalation(prisma: any, userId: string, rule: AnomalyDetectionRule): Promise<SecurityEvent | null> {
    const recentChanges = await prisma.userActivity.findMany({
      where: {
        userId,
        action: {
          in: ['USER_UPDATED', 'ROLE_CHANGED'],
        },
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (recentChanges.length > 0) {
      return {
        id: `privilege_${userId}_${Date.now()}`,
        userId,
        type: 'critical',
        severity: rule.severity,
        title: 'Privilege Escalation Detected',
        description: 'User role or permissions were recently modified',
        riskScore: 90,
        indicators: ['privilege', 'security'],
        timestamp: new Date(),
        metadata: { changes: recentChanges.length },
      };
    }

    return null;
  }

  // Detect API abuse
  private static async detectAPIAbuse(prisma: any, userId: string, rule: AnomalyDetectionRule): Promise<SecurityEvent | null> {
    const timeWindow = new Date(Date.now() - (rule.timeWindow! * 60 * 1000));
    
    const apiCallCount = await prisma.userActivity.count({
      where: {
        userId,
        action: 'API_CALL',
        timestamp: {
          gte: timeWindow,
        },
      },
    });

    if (apiCallCount > rule.threshold!) {
      return {
        id: `api_abuse_${userId}_${Date.now()}`,
        userId,
        type: 'threat',
        severity: rule.severity,
        title: 'API Abuse Detected',
        description: `${apiCallCount} API calls in ${rule.timeWindow} minutes (threshold: ${rule.threshold})`,
        riskScore: Math.min(88, 70 + (apiCallCount - rule.threshold!) * 2),
        indicators: ['api', 'automation'],
        timestamp: new Date(),
        metadata: { apiCallCount, threshold: rule.threshold },
      };
    }

    return null;
  }

  // Detect data exfiltration
  private static async detectDataExfiltration(prisma: any, userId: string, rule: AnomalyDetectionRule): Promise<SecurityEvent | null> {
    const timeWindow = new Date(Date.now() - (rule.timeWindow! * 60 * 1000));
    
    const dataExports = await prisma.userActivity.findMany({
      where: {
        userId,
        action: 'DATA_EXPORT',
        timestamp: {
          gte: timeWindow,
        },
      },
    });

    const totalDataSize = dataExports.reduce((sum, activity) => {
      return sum + (activity.metadata?.dataSize || 0);
    }, 0);

    if (totalDataSize > rule.threshold!) {
      return {
        id: `exfil_${userId}_${Date.now()}`,
        userId,
        type: 'critical',
        severity: rule.severity,
        title: 'Potential Data Exfiltration',
        description: `${totalDataSize}MB of data exported in ${rule.timeWindow} minutes`,
        riskScore: Math.min(95, 80 + (totalDataSize - rule.threshold!) / 10),
        indicators: ['data_export', 'exfiltration'],
        timestamp: new Date(),
        metadata: { totalDataSize, exportCount: dataExports.length },
      };
    }

    return null;
  }

  // Store security event
  static async storeSecurityEvent(event: SecurityEvent): Promise<void> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      await prisma.securityEvent.create({
        data: {
          id: event.id,
          userId: event.userId,
          type: event.type,
          severity: event.severity,
          title: event.title,
          description: event.description,
          riskScore: event.riskScore,
          indicators: JSON.stringify(event.indicators),
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          metadata: JSON.stringify(event.metadata || {}),
          createdAt: event.timestamp,
        },
      });

      await prisma.$disconnect();
    } catch (error) {
      await prisma.$disconnect();
      throw error;
    }
  }

  // Get security events for admin dashboard
  static async getSecurityEvents(limit: number = 50): Promise<SecurityEvent[]> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const events = await prisma.securityEvent.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      await prisma.$disconnect();

      return events.map(event => ({
        id: event.id,
        userId: event.userId,
        user: event.user as any,
        type: event.type,
        severity: event.severity,
        title: event.title,
        description: event.description,
        riskScore: event.riskScore,
        indicators: JSON.parse(event.indicators || '[]'),
        timestamp: event.createdAt,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        metadata: JSON.parse(event.metadata || '{}'),
      }));
    } catch (error) {
      await prisma.$disconnect();
      return [];
    }
  }

  // Get security statistics
  static async getSecurityStats(): Promise<{
    totalEvents: number;
    criticalEvents: number;
    highRiskEvents: number;
    recentAnomalies: number;
    topThreats: Array<{ type: string; count: number }>;
  }> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const totalEvents = await prisma.securityEvent.count();
      const criticalEvents = await prisma.securityEvent.count({
        where: { severity: 'critical' },
      });
      const highRiskEvents = await prisma.securityEvent.count({
        where: {
          severity: {
            in: ['high', 'critical'],
          },
        },
      });
      
      const recentTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentAnomalies = await prisma.securityEvent.count({
        where: {
          type: 'anomaly',
          createdAt: {
            gte: recentTime,
          },
        },
      });

      const topThreats = await prisma.securityEvent.groupBy({
        by: ['type'],
        _count: true,
        orderBy: {
          _count: {
            type: 'desc',
          },
        },
        take: 5,
      });

      await prisma.$disconnect();

      return {
        totalEvents,
        criticalEvents,
        highRiskEvents,
        recentAnomalies,
        topThreats: topThreats.map(threat => ({
          type: threat.type,
          count: threat._count,
        })),
      };
    } catch (error) {
      await prisma.$disconnect();
      return {
        totalEvents: 0,
        criticalEvents: 0,
        highRiskEvents: 0,
        recentAnomalies: 0,
        topThreats: [],
      };
    }
  }

  // Simple distance estimation (would use proper IP geolocation in production)
  private static estimateDistance(ip1: string, ip2: string): number {
    // Simplified version - in production, use IP geolocation API
    const hash1 = ip1.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff, 0);
    const hash2 = ip2.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff, 0);
    return Math.abs(hash1 - hash2) % 15000; // Random distance up to 15000km
  }
}