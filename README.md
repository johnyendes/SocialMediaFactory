# Social Media Factory

🚀 **Ultimate Agent Workforce Platform** - A powerful AI-powered platform for creating and managing social media content, courses, blogs, and more using advanced AI agents.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## 🌟 Features

### Core Capabilities
- **🤖 AI Agent Workforce**: 7 specialized AI agents for different content types
  - CourseForge Agent: Create comprehensive online courses
  - Blog Factory Agent: Generate engaging blog posts
  - Social Media Agent: Create viral social media content
  - Tech Factory Agent: Build technical documentation
  - App Factory Agent: Generate application code
  - Bot Factory Agent: Create AI chatbots
  - Content Factory Agent: Generate marketing content

### Enterprise Features
- **🔐 Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (ADMIN/USER)
  - Secure password hashing with bcrypt
  - HTTP-only cookies for session management

- **🏢 Organization Management**
  - Multi-tenant support
  - Organization branding and customization
  - White-label capabilities
  - Custom domain support

- **🔒 Security & Compliance**
  - GDPR compliance tools
  - Data export/audit trails
  - AI security monitoring
  - MFA (Multi-Factor Authentication)
  - Biometric authentication support
  - Hardware key authentication (WebAuthn)

- **📊 Analytics & Insights**
  - Real-time monitoring
  - Performance tracking
  - User behavior analytics
  - AI insights generation
  - Competitive intelligence

## 🏗️ Architecture

This project uses a **monorepo structure** with separate frontend and backend:

```
SocialMediaFactory/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   ├── public/       # Static assets
│   └── ...
├── backend/           # Next.js API server
│   ├── app/api/      # API routes
│   ├── lib/          # Backend utilities
│   ├── prisma/       # Database schema & migrations
│   ├── scripts/      # Database scripts
│   └── ...
├── packages/          # Shared packages
│   └── shared/       # Shared types & utilities
├── .github/           # CI/CD workflows
├── docker-compose.yml # Docker orchestration
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **UI Components**: Radix UI primitives
- **Charts**: Recharts

### Backend
- **Framework**: Next.js 14 (API Routes)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer / Resend
- **AI Integration**: OpenAI API
- **Python Integration**: Ultimate Agent Workforce (Python agents)

### DevOps
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (Frontend), Vercel/Railway (Backend)
- **Version Control**: Git

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Python 3.8+ (for agent execution)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/johnyendes/SocialMediaFactory.git
cd SocialMediaFactory
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 3. Configure Environment Variables

```bash
# Copy environment example
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="your-jwt-secret-key-here"

# OpenAI API (for AI features)
OPENAI_API_KEY="your-openai-api-key-here"

# API URLs
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Database

```bash
# Push database schema
npm run db:push

# Run seed script (optional)
npm run db:seed
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:3001
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api (root endpoint)

## 📁 Project Structure

### Frontend (`/frontend`)
```
frontend/
├── app/
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── agent-factory/     # Agent factory UI
│   ├── admin/             # Admin panel
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/               # UI components
│   ├── AISecurityDashboard.tsx
│   ├── WhiteLabelSettings.tsx
│   └── ...               # Other components
├── public/               # Static assets
└── package.json
```

### Backend (`/backend`)
```
backend/
├── app/
│   ├── api/
│   │   ├── auth/         # Authentication endpoints
│   │   ├── agent/        # Agent execution endpoints
│   │   ├── admin/        # Admin endpoints
│   │   └── ...           # Other API routes
│   ├── layout.tsx        # Root layout (API mode)
│   └── page.tsx          # API root endpoint
├── lib/
│   ├── auth-middleware.ts
│   ├── agent-workforce.ts
│   ├── gdpr-compliance.ts
│   └── ...               # Other utilities
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── scripts/              # Database scripts
├── types/                # TypeScript types
├── ULTIMATE_AGENT_WORKFORCE.py
└── package.json
```

## 🔧 Configuration

### Frontend Configuration

Edit `frontend/next.config.js` for frontend-specific settings:

```javascript
module.exports = {
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:3001',
  },
  // ... other config
};
```

### Backend Configuration

Edit `backend/next.config.js` for backend-specific settings:

```javascript
module.exports = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  // ... other config
};
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Docker Builds

```bash
# Build backend
docker build -t smf-backend ./backend

# Build frontend
docker build -t smf-frontend ./frontend

# Run backend
docker run -p 3001:3001 --env-file .env smf-backend

# Run frontend
docker run -p 3000:3000 --env-file .env smf-frontend
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🚢 Deployment

### Vercel Deployment

#### Frontend
```bash
cd frontend
vercel --prod
```

#### Backend
```bash
cd backend
vercel --prod
```

### Manual Deployment

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build

# Start production servers
npm run start:frontend
npm run start:backend
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Agent Endpoints

- `POST /api/agent/execute` - Execute any agent
- `POST /api/agent/courseforge` - Execute CourseForge agent
- `POST /api/agent/blog` - Execute Blog agent
- `POST /api/agent/social` - Execute Social Media agent
- `POST /api/agent/tech` - Execute Tech Factory agent

### Admin Endpoints

- `GET /api/admin/users` - List all users
- `GET /api/admin/organizations` - List organizations
- `GET /api/admin/security` - Security events

## 🔒 Security

### Authentication
- JWT tokens with 7-day expiry
- HTTP-only cookies for session storage
- bcrypt password hashing (10 rounds)
- Secure password validation

### Data Protection
- GDPR compliance tools
- Data export functionality
- Audit logging
- Secure API endpoints

### Best Practices
- Never commit `.env` files
- Use strong JWT secrets in production
- Enable HTTPS in production
- Implement rate limiting
- Regular security audits

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **johnyendes** - Initial work & architecture

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- OpenAI for AI capabilities
- The open-source community

## 📞 Support

For support, open an issue in the repository.

## 🗺️ Roadmap

- [ ] Add more agent types
- [ ] Implement real-time collaboration
- [ ] Add mobile app support
- [ ] Implement advanced analytics
- [ ] Add plugin system
- [ ] Multi-language support
- [ ] Advanced AI model selection

---

**Built with ❤️ using Next.js, TypeScript, and AI**