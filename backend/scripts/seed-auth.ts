import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAuth() {
  console.log('🌱 Seeding authentication system...');

  // Demo users with different roles
  const demoUsers = [
    {
      email: 'admin@marketintel.com',
      name: 'Admin User',
      password: 'password',
      role: 'ADMIN',
    },
    {
      email: 'analyst@marketintel.com',
      name: 'Analyst User',
      password: 'password',
      role: 'ANALYST',
    },
    {
      email: 'user@marketintel.com',
      name: 'Regular User',
      password: 'password',
      role: 'USER',
    },
    {
      email: 'viewer@marketintel.com',
      name: 'Viewer User',
      password: 'password',
      role: 'VIEWER',
    },
  ];

  for (const user of demoUsers) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 12);

      // Create user
      const createdUser = await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          password: hashedPassword,
          role: user.role,
          emailVerified: new Date(),
        },
      });

      // Create user preferences
      await prisma.userPreferences.create({
        data: {
          userId: createdUser.id,
          theme: 'light',
          emailNotifications: true,
          weeklyDigest: true,
          defaultDashboard: 'overview',
        },
      });

      console.log(`✅ Created ${user.role} user: ${user.email}`);

      // Track signup activity
      await prisma.userActivity.create({
        data: {
          userId: createdUser.id,
          action: 'SIGNUP',
          resource: 'AUTH',
          metadata: { 
            role: user.role, 
            signupMethod: 'seed',
            isDemo: true 
          },
        },
      });

      // Create some sample activity for demo
      const sampleActivities = user.role === 'ADMIN' 
        ? ['LOGIN', 'USER_MANAGEMENT', 'SYSTEM_ANALYTICS']
        : user.role === 'ANALYST'
        ? ['LOGIN', 'SCORING_REQUEST', 'REPORT_GENERATION', 'PORTFOLIO_ANALYSIS']
        : ['LOGIN', 'SCORING_REQUEST', 'REPORT_GENERATION'];

      for (const activity of sampleActivities) {
        await prisma.userActivity.create({
          data: {
            userId: createdUser.id,
            action: activity as any,
            resource: 'DEMO',
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
            metadata: { isDemo: true },
          },
        });
      }

      // Create sample reports for non-viewer users
      if (user.role !== 'VIEWER') {
        const reportCount = user.role === 'ADMIN' ? 5 : user.role === 'ANALYST' ? 3 : 2;
        
        for (let i = 0; i < reportCount; i++) {
          await prisma.report.create({
            data: {
              userId: createdUser.id,
              name: `${['AAPL', 'GOOGL', 'MSFT'][i % 3]} Market Intelligence Report`,
              type: 'MARKET_SUMMARY',
              format: 'JSON',
              content: {
                sample: 'Demo report content',
                company: ['Apple', 'Google', 'Microsoft'][i % 3],
                symbol: ['AAPL', 'GOOGL', 'MSFT'][i % 3],
              },
              schedule: null,
              lastGenerated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random time in last month
            },
          });
        }
      }

    } else {
      console.log(`⚠️ User already exists: ${user.email}`);
    }
  }

  console.log('✅ Authentication seeding completed!');
  console.log('\n📋 Demo Credentials:');
  console.log('Admin: admin@marketintel.com / password');
  console.log('Analyst: analyst@marketintel.com / password');
  console.log('User: user@marketintel.com / password');
  console.log('Viewer: viewer@marketintel.com / password');
}

async function main() {
  try {
    await seedAuth();
  } catch (error) {
    console.error('❌ Error seeding authentication:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}