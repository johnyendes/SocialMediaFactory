# Social Media Factory - Frontend

Frontend application for Social Media Factory platform. Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

Application runs on `http://localhost:3000`

## 📁 Structure

```
frontend/
├── app/
│   ├── auth/              # Authentication pages
│   │   ├── signin/
│   │   └── signup/
│   ├── dashboard/         # Dashboard page
│   ├── agent-factory/     # Agent factory UI
│   ├── admin/             # Admin panel
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/               # UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── AISecurityDashboard.tsx
│   ├── WhiteLabelSettings.tsx
│   └── ...               # Other components
└── public/               # Static assets
```

## 🔧 Environment Variables

Required variables (see `.env.example`):

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🎨 Features

### Pages
- **Landing Page**: Introduction and sign-up
- **Dashboard**: Main user dashboard
- **Agent Factory**: Interface for all 7 AI agents
- **Admin Panel**: Admin management interface
- **Authentication**: Sign-in and sign-up pages

### Components
- UI components (Button, Card, Input, etc.)
- AI Security Dashboard
- White Label Settings
- GDPR Compliance Tools
- Analytics Charts

## 🎯 Usage

### Authentication

```typescript
// Sign in
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// Sign up
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, name }),
});
```

### Agent Execution

```typescript
// Execute agent
const response = await fetch('/api/agent/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'courseforge',
    prompt: 'Create a course on React',
  }),
});
```

## 🎨 Styling

Uses Tailwind CSS for styling:

```typescript
// Example component
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-bold">Title</h2>
</div>
```

## 🐳 Docker

```bash
# Build image
docker build -t smf-frontend .

# Run container
docker run -p 3000:3000 --env-file .env smf-frontend
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
```

## 🔒 Security

- All API calls go through backend
- No direct database access
- Secure cookie handling
- Input validation
- XSS protection

## 🚢 Deployment

Deploy to Vercel, Netlify, or any static hosting:

```bash
# Build
npm run build

# Deploy
vercel --prod
```

For production, set `NEXT_PUBLIC_API_URL` to your production backend URL.

## 🎨 Customization

### Branding

Edit `app/globals.css` for global styles and branding:

```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
}
```

### Components

All components are in the `components/` directory and can be customized as needed.

## 📱 Responsive Design

All pages are responsive and work on:
- Desktop (1280px+)
- Tablet (768px - 1279px)
- Mobile (< 768px)

## 🔌 API Integration

The frontend communicates with the backend through the Next.js API rewrite rules defined in `next.config.js`. This allows seamless API calls without CORS issues during development.

## 🐛 Debugging

```bash
# Run with debug logging
DEBUG=* npm run dev

# Check network requests in browser DevTools
# Check console for errors
```

## 📊 Performance

- Code splitting by default
- Image optimization with Next.js Image
- Lazy loading for components
- Opt-in static generation