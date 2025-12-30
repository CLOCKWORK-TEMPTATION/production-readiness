# Production Readiness Analyzer - Project Structure

## Directory Organization

### Root Level Structure
```
production-readiness/
├── src/                    # Frontend React application source code
├── server/                 # Backend Express.js proxy server
├── public/                 # Static assets and favicon
├── docker/                 # Docker configuration files
├── api/                    # Vercel serverless API functions
├── .github/                # GitHub Actions CI/CD workflows
├── .amazonq/               # Amazon Q IDE integration rules
├── logs/                   # Application log files
└── [config files]          # Various configuration files
```

## Core Components

### Frontend Application (`src/`)
```
src/
├── components/             # React UI components
│   ├── ui/                # Reusable UI component library (shadcn/ui)
│   ├── __tests__/         # Component unit tests
│   ├── AnalysisForm.tsx   # Main repository input form
│   ├── ReportView.tsx     # Analysis results display
│   ├── ReportHistory.tsx  # Local storage report management
│   └── StatusBadge.tsx    # Status indicator components
├── lib/                   # Core business logic and utilities
│   ├── analyzer.ts        # Main analysis orchestration
│   ├── github.ts          # GitHub API integration
│   ├── sentry.ts          # Error tracking setup
│   └── utils.ts           # Common utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── utils/                 # Additional utility modules
├── styles/                # CSS and styling files
└── App.tsx               # Main application component
```

### Backend Server (`server/`)
```
server/
└── index.js              # Express.js proxy server for GenAI API
```

### Configuration & Infrastructure
```
├── docker/
│   └── nginx.conf         # Nginx configuration for production
├── .github/
│   └── workflows/
│       └── ci.yml         # GitHub Actions CI pipeline
├── Dockerfile             # Container build configuration
├── docker-compose.yml     # Multi-container orchestration
├── vercel.json           # Vercel deployment configuration
└── nginx.conf            # Alternative Nginx configuration
```

## Architectural Patterns

### Component Architecture
- **Atomic Design**: UI components organized in hierarchical structure
- **Composition Pattern**: Reusable components with flexible prop interfaces
- **Container/Presenter**: Separation of business logic from presentation
- **Custom Hooks**: Encapsulated state management and side effects

### Data Flow Architecture
```
User Input → AnalysisForm → GitHub API → Backend Proxy → GenAI API → Report Display
                ↓
         Local Storage ← Report History ← Analysis Results
```

### Security Architecture
- **API Key Protection**: Server-side proxy prevents client-side key exposure
- **CORS Configuration**: Strict origin validation in production
- **CSP Headers**: Content Security Policy for XSS prevention
- **Helmet Integration**: Security middleware for Express server

### State Management
- **React Query**: Server state management and caching
- **Local Storage**: Client-side persistence for report history
- **React Hook Form**: Form state and validation management
- **Context API**: Global application state (themes, settings)

## Key Relationships

### Frontend Dependencies
- **React 19**: Core UI framework with latest features
- **Tailwind CSS**: Utility-first styling framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation and interaction library
- **React Query**: Data fetching and synchronization

### Backend Dependencies
- **Express.js**: Web server framework
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Morgan**: HTTP request logging
- **Dotenv**: Environment variable management

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **Vitest**: Unit testing framework
- **ESLint**: Code linting and style enforcement
- **Lighthouse CI**: Performance and accessibility testing

## Deployment Architecture

### Multi-Environment Support
- **Development**: Local Vite dev server with hot reload
- **Staging**: Vercel preview deployments for testing
- **Production**: Multiple deployment options (Vercel, Docker, Nginx)

### Containerization Strategy
- **Multi-stage Dockerfile**: Optimized production builds
- **Alpine Linux**: Minimal base image for security
- **Non-root User**: Container security best practices
- **Health Checks**: Built-in container health monitoring

### CI/CD Pipeline
- **GitHub Actions**: Automated testing and deployment
- **Dependency Updates**: Automated security updates via Dependabot
- **Performance Monitoring**: Lighthouse CI integration
- **Quality Gates**: Test coverage and linting requirements