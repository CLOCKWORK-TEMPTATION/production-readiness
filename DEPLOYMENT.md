# Production Readiness Analyzer

## Deployment Guide

### Environment Variables
```bash
VITE_SENTRY_DSN=your_sentry_dsn
GOOGLE_AI_API_KEY=your_google_ai_key
```

### Vercel Deployment
1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Docker Deployment
```bash
docker build -t production-readiness .
docker run -p 80:80 production-readiness
```

### Local Development
```bash
npm install
npm run dev
```

### Testing
```bash
npm run mobile-test  # Mobile testing on network
npm run accessibility-check  # A11y verification
```

## Security Features
- API keys secured via backend proxy
- CSP headers configured
- Sentry error tracking (production only)
- npm audit in CI pipeline

## Performance
- Lighthouse CI checks (>90% performance/accessibility)
- Mobile-optimized with touch support
- Gzip compression and asset caching