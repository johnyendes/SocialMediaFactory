# Social Media Factory - Backend

Backend API server for Social Media Factory platform. Built with Next.js 14, TypeScript, Prisma, and SQLite.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Setup database
npm run db:push
npm run db:seed  # Optional

# Start development server
npm run dev
```

Server runs on `http://localhost:3001`

## 📁 Structure

```
backend/
├── app/api/           # API routes
│   ├── auth/         # Authentication endpoints
│   ├── agent/        # Agent execution endpoints
│   ├── admin/        # Admin endpoints
│   └── ...
├── lib/              # Utilities and helpers
│   ├── auth-middleware.ts
│   ├── agent-workforce.ts
│   ├── gdpr-compliance.ts
│   └── ...
├── prisma/           # Database
│   ├── schema.prisma
│   └── seed.ts
├── scripts/          # Database scripts
├── types/            # TypeScript types
└── ULTIMATE_AGENT_WORKFORCE.py
```

## 🔧 Environment Variables

Required variables (see `.env.example`):

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="your-openai-key"
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Agents
- `POST /api/agent/execute` - Execute any agent
- `POST /api/agent/courseforge` - CourseForge agent
- `POST /api/agent/blog` - Blog agent
- `POST /api/agent/social` - Social Media agent

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/organizations` - List organizations

## 🗄️ Database

### Prisma Commands

```bash
# Push schema to database
npm run db:push

# Create migration
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Schema Overview

The database includes models for:
- Users & Organizations
- Authentication & Security
- GDPR Compliance
- Agent Workforce
- Analytics & Monitoring

## 🐳 Docker

```bash
# Build image
docker build -t smf-backend .

# Run container
docker run -p 3001:3001 --env-file .env smf-backend
```

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 📦 Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm test             # Run tests
npm run db:push      # Push schema
npm run db:migrate   # Create migration
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## 🔒 Security

- JWT authentication with HTTP-only cookies
- bcrypt password hashing
- CORS configuration
- Rate limiting (implement in production)
- Input validation with Zod

## 🚢 Deployment

Deploy to Vercel, Railway, or any Node.js hosting:

```bash
# Build
npm run build

# Start
npm start
```

For production, ensure all environment variables are set and use a production database.