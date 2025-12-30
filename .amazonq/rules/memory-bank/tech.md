# Production Readiness Analyzer - Technology Stack

## Programming Languages & Versions

### Primary Languages
- **TypeScript 5.7.2**: Main development language for type safety
- **JavaScript ES2022**: Backend server and configuration files
- **CSS3**: Styling with modern features and custom properties
- **HTML5**: Semantic markup with accessibility features

### Runtime Requirements
- **Node.js 18+**: JavaScript runtime environment
- **npm 8+**: Package manager and script runner

## Frontend Technology Stack

### Core Framework
- **React 19.0.0**: Latest React with concurrent features
- **React DOM 19.2.3**: DOM rendering and hydration
- **Vite 7.2.6**: Build tool and development server

### UI Framework & Styling
- **Tailwind CSS 4.1.11**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives library
- **shadcn/ui**: Pre-built component collection
- **Framer Motion 12.23.26**: Animation and gesture library
- **Lucide React**: Icon library with consistent design

### State Management & Data Fetching
- **React Query (TanStack) 5.90.15**: Server state management
- **React Hook Form 7.54.2**: Form state and validation
- **Zod 3.25.76**: Schema validation and type inference

### Development Tools
- **TypeScript**: Static type checking and IntelliSense
- **ESLint 9.28.0**: Code linting and style enforcement
- **Vite Plugin React SWC**: Fast React refresh and compilation

## Backend Technology Stack

### Server Framework
- **Express.js 5.2.1**: Web application framework
- **Node.js**: Server-side JavaScript runtime

### Security & Middleware
- **Helmet 8.1.0**: Security headers and protection
- **CORS 2.8.5**: Cross-origin resource sharing
- **Morgan 1.10.1**: HTTP request logging middleware
- **dotenv 17.2.3**: Environment variable management

### External APIs
- **Google GenAI**: AI-powered code analysis
- **GitHub API (Octokit)**: Repository data fetching
- **Sentry**: Error tracking and performance monitoring

## Testing Framework

### Testing Libraries
- **Vitest 4.0.16**: Unit testing framework
- **Testing Library React 16.3.1**: Component testing utilities
- **Testing Library Jest DOM 6.9.1**: DOM testing matchers
- **Testing Library User Event 14.6.1**: User interaction simulation
- **jsdom 27.4.0**: DOM implementation for testing

### Coverage & Quality
- **Vitest Coverage V8**: Code coverage reporting
- **Vitest UI**: Interactive test runner interface
- **Lighthouse CI**: Performance and accessibility testing
- **Axe Core React**: Accessibility testing integration

## Build System & Tooling

### Build Configuration
- **Vite**: Module bundler and build tool
- **TypeScript Compiler**: Type checking and compilation
- **SWC**: Fast JavaScript/TypeScript compiler
- **PostCSS**: CSS processing and optimization

### Development Scripts
```json
{
  "dev": "vite",                              // Development server
  "build": "tsc && vite build",               // Production build
  "test": "vitest run",                       // Run tests
  "test:coverage": "vitest --coverage",       // Coverage report
  "server": "node server/index.js",          // Backend server
  "mobile-test": "vite --host 0.0.0.0 --port 3000"  // Mobile testing
}
```

## Deployment Technologies

### Containerization
- **Docker**: Container platform and orchestration
- **Alpine Linux**: Minimal base image for containers
- **Multi-stage Builds**: Optimized production images

### Platform Support
- **Vercel**: Serverless deployment platform
- **Nginx**: Web server for traditional hosting
- **Kubernetes**: Container orchestration (optional)

### CI/CD Pipeline
- **GitHub Actions**: Automated workflows and deployment
- **Dependabot**: Automated dependency updates
- **Lighthouse CI**: Performance monitoring in CI

## Environment Configuration

### Environment Variables
```bash
# Client-side (VITE_ prefix required)
VITE_API_URL=https://api.yourapp.com
VITE_SENTRY_DSN=https://...@sentry.io/123

# Server-side (secure)
GEMINI_API_KEY=your-api-key
PORT=3001
FRONTEND_URL=https://yourapp.com
NODE_ENV=production
```

### Configuration Files
- **package.json**: Dependencies and scripts
- **tsconfig.json**: TypeScript compiler configuration
- **vite.config.ts**: Build tool configuration
- **tailwind.config.js**: CSS framework configuration
- **vitest.config.ts**: Testing framework setup

## Development Commands

### Setup & Installation
```bash
npm install                    # Install dependencies
cp .env.example .env.local    # Configure environment
```

### Development Workflow
```bash
npm run dev                   # Start development server
npm run server               # Start backend proxy
npm run dev:all              # Start both frontend and backend
npm run test                 # Run unit tests
npm run test:ui              # Interactive test runner
```

### Production Preparation
```bash
npm run build                # Build for production
npm run preview              # Preview production build
npm run accessibility-check  # Run accessibility tests
npm run mobile-test         # Test mobile compatibility
```

### Quality Assurance
```bash
npm run lint                 # Code linting
npm run test:coverage        # Test coverage report
npm run optimize            # Vite optimization
```

## Browser Compatibility

### Desktop Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Support
- Chrome Mobile 90+
- Safari iOS 14+
- Samsung Internet 14+
- Firefox Mobile 88+

## Performance Targets

### Lighthouse Scores
- Performance: >80
- Accessibility: >90
- Best Practices: >90
- SEO: >80

### Bundle Size Optimization
- Tree shaking enabled
- Code splitting by routes
- Dynamic imports for heavy components
- Asset optimization and compression