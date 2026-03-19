const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        email: 'admin@test.com',
        name: 'Test Admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    // Create test organization
    const organization = await prisma.organization.upsert({
      where: { slug: 'test-org' },
      update: {},
      create: {
        name: 'Test Organization',
        slug: 'test-org',
        isActive: true,
        theme: JSON.stringify({
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          theme: 'professional'
        }),
        settings: JSON.stringify({
          welcomeMessage: 'Welcome to Test Organization',
          loginButtonText: 'Sign In'
        })
      }
    });

    // Link user to organization
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { organizationId: organization.id }
    });

    // Create sample GDPR request with valid user ID
    await prisma.gDPRDataRequest.create({
      data: {
        userId: adminUser.id,
        type: 'GDPR_COMPLETE',
        status: 'pending'
      }
    });

    console.log('✅ Admin user and test data created successfully');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');
    console.log('Organization ID:', organization.id);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();