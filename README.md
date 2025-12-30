# Production Readiness App

## 🚀 Deployment Guide

This guide provides comprehensive instructions for deploying the Production Readiness App to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
  - [Vercel Deployment](#vercel-deployment)
  - [Docker Deployment](#docker-deployment)
  - [Nginx Deployment](#nginx-deployment)
- [Environment Variables](#environment-variables)
- [Monitoring and Logging](#monitoring-and-logging)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Privacy Policy](#privacy-policy)

## Prerequisites

- Node.js 18+
- npm 8+
- Docker (for containerized deployment)
- Vercel account (for Vercel deployment)
- Server access (for self-hosted deployment)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/production-readiness.git
cd production-readiness
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env.local
```

## Deployment Options

### Vercel Deployment

#### Automatic Deployment

1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Environment Variables**
   - Add the following environment variables in Vercel dashboard:
     - `VITE_API_URL`: Your backend API endpoint
     - `VITE_SENTRY_DSN`: Sentry DSN for error tracking

3. **Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

#### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Docker Deployment

#### Build and Run Locally

```bash
# Build the Docker image
docker build -t production-readiness .

# Run the container
docker run -p 8080:8080 production-readiness
```

#### Production Deployment

1. **Push to Registry**
   ```bash
   docker tag production-readiness your-registry/production-readiness:latest
   docker push your-registry/production-readiness:latest
   ```

2. **Deploy to Kubernetes**
   ```yaml
   # k8s-deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: production-readiness
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: production-readiness
     template:
       metadata:
         labels:
           app: production-readiness
       spec:
         containers:
         - name: app
           image: your-registry/production-readiness:latest
           ports:
           - containerPort: 8080
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: production-readiness-service
   spec:
     selector:
       app: production-readiness
     ports:
     - protocol: TCP
       port: 80
       targetPort: 8080
   ```

### Nginx Deployment

#### 1. Build the Application

```bash
npm run build
```

#### 2. Configure Nginx

The Nginx configuration file is provided at [docker/nginx.conf](docker/nginx.conf):

```bash
# Copy built files and nginx config to server
scp -r dist/* user@your-server:/var/www/production-readiness/
scp docker/nginx.conf user@your-server:/etc/nginx/sites-available/production-readiness

# Enable site
sudo ln -s /etc/nginx/sites-available/production-readiness /etc/nginx/sites-enabled/

# Restart Nginx
sudo systemctl restart nginx
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API endpoint | `https://api.yourapp.com` |
| `VITE_SENTRY_DSN` | Sentry DSN for error tracking | `https://...@sentry.io/123` |

### Server-Side Variables (for backend server)

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google GenAI API key (server-side only) | `your-api-key` |
| `PORT` | Server port | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://yourapp.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_ENV` | Application environment | `production` |

## Monitoring and Logging

### Sentry Integration

The application includes Sentry for error tracking and performance monitoring:

1. **Setup Sentry Project**
   - Create a project at [Sentry.io](https://sentry.io)
   - Get your DSN from Project Settings

2. **Configure Environment**
   ```bash
   export VITE_SENTRY_DSN="your-sentry-dsn-here"
   ```

3. **Monitor Performance**
   - View errors in Sentry dashboard
   - Monitor performance metrics
   - Set up alerts for critical issues

### Health Checks

The application provides health check endpoints:

- **Frontend Health**: `GET /health`
- **API Health**: `GET /api/health`

## Security Considerations

### 1. API Key Security
- **NEVER** store API keys with `VITE_` prefix in production
- Use server-side environment variables for sensitive keys
- The proxy server ([server/index.js](server/index.js)) handles all GenAI API calls

### 2. HTTPS Enforcement
- Always use HTTPS in production
- Configure SSL/TLS certificates
- Redirect HTTP to HTTPS

### 3. Content Security Policy
The application includes CSP headers to prevent XSS attacks:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
```

### 4. Docker Security
- Use minimal base images (alpine)
- Run containers as non-root user
- Scan images for vulnerabilities

## Performance Optimization

### 1. Build Optimization
```bash
# Production build with optimizations
npm run build

# Run tests
npm run test

# Run accessibility checks
npm run accessibility-check
```

### 2. Caching Strategy
- Static assets: 1 year cache
- API responses: 5-15 minutes
- HTML: No cache (dynamic)

### 3. CDN Integration
Consider using a CDN for:
- Static assets delivery
- Global performance improvement
- DDoS protection

### 4. Lighthouse Scores
Target scores:
- Performance: >80
- Accessibility: >90
- Best Practices: >90
- SEO: >80

## Mobile Browser Compatibility

The application supports modern mobile browsers:

- Chrome Mobile 90+
- Safari iOS 14+
- Samsung Internet 14+
- Firefox Mobile 88+

### Running Mobile Compatibility Check

```bash
# Run mobile compatibility test
npm run mobile-test
```

Then open http://localhost:3000 on your mobile device to verify functionality.

## Privacy Policy

### Data Collection and Usage

This application ("Production Readiness Analyzer") is committed to protecting your privacy. This policy explains how we handle data:

#### 1. GitHub Repository Data
- **What we collect**: Public repository metadata (files structure, package.json, README)
- **How we use it**: To analyze production readiness and generate reports
- **Data retention**: No data is stored on our servers. Analysis is performed in real-time.

#### 2. AI Processing (Google GenAI)
- **Data sent to Google**: Repository metadata and file contents are sent to Google's Gemini API for analysis
- **Purpose**: To generate intelligent production readiness assessments
- **Google's use**: Google may use this data to improve their services. See [Google's Privacy Policy](https://policies.google.com/privacy)

#### 3. Error Tracking (Sentry)
- **What we collect**: Error logs, browser information, performance metrics
- **Purpose**: To diagnose and fix application issues
- **Data control**: You can disable Sentry by not setting `VITE_SENTRY_DSN`

#### 4. Local Storage
- Reports are stored locally in your browser using localStorage
- No personal data is transmitted to our servers
- You can delete stored reports at any time

#### 5. Third-Party Services
- **GitHub API**: Used to fetch public repository information
- **Google Gemini API**: Used for AI-powered analysis
- **Sentry**: Used for error tracking (optional)

### Your Rights
- You can choose not to use this service
- You can delete locally stored data at any time
- You can opt-out of error tracking by not configuring Sentry

### Contact
For privacy-related questions, contact: privacy@yourapp.com

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variables Not Loading**
   - Check `.env.local` file exists
   - Verify variable names start with `VITE_` for client-side
   - Restart development server

3. **Docker Issues**
   ```bash
   # Build with no cache
   docker build --no-cache -t production-readiness .

   # Check container logs
   docker logs container-name
   ```

4. **API Not Responding**
   - Ensure the backend server is running: `npm run server`
   - Check `GEMINI_API_KEY` is set in server environment
   - Verify API proxy is configured correctly

## Support

For support and questions:
- 📧 Email: support@yourapp.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/production-readiness/issues)
