const { PrismaClient } = require('@prisma/client');

async function createSession() {
  const prisma = new PrismaClient();
  
  try {
    // Get admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (!admin) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Admin user found:', admin.email, 'Role:', admin.role);
    
    // Test database connection
    const userCount = await prisma.user.count();
    console.log('Total users in database:', userCount);
    
    // Check preferences
    const prefs = await prisma.userPreferences.findUnique({
      where: { userId: admin.id }
    });
    
    console.log('User preferences:', prefs ? 'Found' : 'Not found');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSession();
