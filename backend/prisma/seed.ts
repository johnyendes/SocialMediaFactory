import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@marketintel.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Created admin user:', adminUser.email)

  // Create test user
  const testPassword = await bcrypt.hash('test123', 10)
  const testUser = await prisma.user.create({
    data: {
      email: 'test@marketintel.com',
      name: 'Test User',
      password: testPassword,
      role: 'USER',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Created test user:', testUser.email)

  // Create user preferences
  await prisma.userPreferences.create({
    data: {
      userId: testUser.id,
      theme: 'dark',
      emailNotifications: true,
      favoriteIndustries: JSON.stringify(['Technology', 'Healthcare']),
      favoriteCompanies: JSON.stringify(['AAPL', 'GOOGL', 'MSFT']),
    },
  })
  console.log('✅ Created user preferences')

  // Create company profiles
  const companies = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      description: 'Technology company that designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.',
      industry: 'Consumer Electronics',
      sector: 'Technology',
      website: 'https://www.apple.com',
      employees: 164000,
      founded: 1976,
      headquarters: 'Cupertino, CA',
      ceo: 'Tim Cook',
      marketCap: 2800000000000,
      revenue: 394328000000,
      netIncome: 96995000000,
      lastUpdated: new Date(),
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      description: 'Multinational technology company focusing on search engine technology, online advertising, cloud computing, and more.',
      industry: 'Internet Services',
      sector: 'Technology',
      website: 'https://www.google.com',
      employees: 190234,
      founded: 1998,
      headquarters: 'Mountain View, CA',
      ceo: 'Sundar Pichai',
      marketCap: 1700000000000,
      revenue: 307394000000,
      netIncome: 73795000000,
      lastUpdated: new Date(),
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      description: 'Technology corporation that develops, manufactures, licenses, supports, and sells computer software, consumer electronics, and personal computers.',
      industry: 'Software',
      sector: 'Technology',
      website: 'https://www.microsoft.com',
      employees: 221000,
      founded: 1975,
      headquarters: 'Redmond, WA',
      ceo: 'Satya Nadella',
      marketCap: 2500000000000,
      revenue: 211915000000,
      netIncome: 72361000000,
      lastUpdated: new Date(),
    },
  ]

  for (const company of companies) {
    await prisma.companyProfile.create({ data: company })
    console.log(`✅ Created company: ${company.name}`)
  }

  // Create market data
  const marketData = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      industry: 'Consumer Electronics',
      sector: 'Technology',
      marketCap: 2800000000000,
      price: 178.45,
      change: 2.34,
      changePercent: 1.33,
      volume: 52000000,
      timestamp: new Date(),
      source: 'SEED_DATA',
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      industry: 'Internet Services',
      sector: 'Technology',
      marketCap: 1700000000000,
      price: 139.82,
      change: -1.23,
      changePercent: -0.87,
      volume: 28000000,
      timestamp: new Date(),
      source: 'SEED_DATA',
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      industry: 'Software',
      sector: 'Technology',
      marketCap: 2500000000000,
      price: 378.91,
      change: 5.67,
      changePercent: 1.52,
      volume: 31000000,
      timestamp: new Date(),
      source: 'SEED_DATA',
    },
  ]

  for (const data of marketData) {
    await prisma.marketData.create({ data })
  }
  console.log('✅ Created market data')

  // Create AI insights
  const insights = [
    {
      type: 'TREND',
      title: 'AI Market Growth Acceleration',
      description: 'The AI technology sector is experiencing unprecedented growth with a 45% increase in investment over the last quarter. Enterprise adoption is driving this surge.',
      confidence: 92,
      impact: 'HIGH',
      timeframe: 'Next 6 months',
      actionable: true,
      source: 'AI_ANALYSIS',
    },
    {
      type: 'OPPORTUNITY',
      title: 'Cloud Computing Expansion',
      description: 'Cloud infrastructure spending is projected to grow 28% year-over-year, presenting significant opportunities for cloud service providers.',
      confidence: 88,
      impact: 'HIGH',
      timeframe: 'Next 12 months',
      actionable: true,
      source: 'AI_ANALYSIS',
    },
    {
      type: 'RISK',
      title: 'Regulatory Changes in EU',
      description: 'New GDPR-style regulations for AI systems may impact deployment timelines for European markets.',
      confidence: 78,
      impact: 'MEDIUM',
      timeframe: 'Next 12 months',
      actionable: true,
      source: 'AI_ANALYSIS',
    },
  ]

  for (const insight of insights) {
    await prisma.aIInsight.create({ data: insight })
  }
  console.log('✅ Created AI insights')

  // Create analytics metrics
  const metrics = [
    {
      name: 'total_analyzed',
      value: 12543,
      unit: 'companies',
      category: 'ANALYTICS',
      timestamp: new Date(),
    },
    {
      name: 'accuracy_rate',
      value: 94.2,
      unit: 'percent',
      category: 'ANALYTICS',
      timestamp: new Date(),
    },
    {
      name: 'processing_speed',
      value: 2.3,
      unit: 'seconds',
      category: 'PERFORMANCE',
      timestamp: new Date(),
    },
    {
      name: 'predictions_made',
      value: 3847,
      unit: 'predictions',
      category: 'ANALYTICS',
      timestamp: new Date(),
    },
  ]

  for (const metric of metrics) {
    await prisma.analyticsMetric.create({ data: metric })
  }
  console.log('✅ Created analytics metrics')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })