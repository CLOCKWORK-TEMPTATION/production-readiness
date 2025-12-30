# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Production Readiness Analyzer** - an interactive React web application that evaluates the production readiness of TypeScript and Python repositories on GitHub. The app generates comprehensive reports in Arabic assessing 10 key domains (functionality, performance, security, infrastructure, monitoring, backup, documentation, testing, compatibility, and compliance).

**Key Technologies:**
- React 19 with TypeScript
- Vite for build tooling
- GitHub Spark framework (includes LLM capabilities via `@github/spark`)
- Tailwind CSS v4 with shadcn/ui components (New York style)
- Radix UI primitives for accessible components
- Framer Motion for animations
- React Hook Form with Zod for form validation
- GitHub API for repository analysis

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (default port 5000)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Run linter
npm run lint

# Kill process on port 5000 (if stuck)
npm run kill

# Optimize dependencies
npm run optimize
```

## Architecture & Code Structure

### Core Application Flow

1. **User Input** → [AnalysisForm.tsx](src/components/AnalysisForm.tsx) validates GitHub URL
2. **URL Parsing** → [github.ts](src/lib/github.ts) extracts owner/repo from various GitHub URL formats
3. **Repository Analysis** → [analyzer.ts](src/lib/analyzer.ts) fetches repo metadata via GitHub API
4. **LLM Report Generation** → Uses GitHub Spark's LLM API (`spark.llm()`) with GPT-4o to generate Arabic production readiness report
5. **Report Display** → [ReportView.tsx](src/components/ReportView.tsx) shows comprehensive assessment
6. **Persistence** → Reports saved using `useKV` hook from GitHub Spark (key-value storage)

### Key Architecture Patterns

**GitHub Spark Integration:**
- The app uses `@github/spark` framework which provides:
  - `useKV()` hook for persistent key-value storage
  - `spark.llm()` for LLM API calls with template literals (`spark.llmPrompt`)
  - Vite plugins that MUST NOT be removed from [vite.config.ts](vite.config.ts#L16-L18)

**State Management:**
- Local component state with React hooks
- Persistent storage via Spark's `useKV` hook (stores reports array)
- No Redux or external state management - intentionally kept simple

**RTL (Right-to-Left) Support:**
- Entire UI is in Arabic with RTL layout
- Toaster configured with `dir="rtl"` in [main.tsx](src/main.tsx#L16)
- Tailwind configured for RTL (uses `ml-*` margin classes appropriately)

**Component Library:**
- UI components in [src/components/ui/](src/components/ui/) from shadcn/ui
- Custom components in [src/components/](src/components/): AnalysisForm, ReportView, ReportHistory, StatusBadge
- Path alias `@/*` maps to `src/*` (configured in both [tsconfig.json](tsconfig.json#L24-L27) and [vite.config.ts](vite.config.ts#L21-L23))

### Data Model

**ProductionReport** ([src/types/report.ts](src/types/report.ts)):
```typescript
{
  id: string
  repository: { url, owner, repo, analyzedAt }
  summary: string
  overallStatus: 'ready' | 'conditional' | 'not-ready' | 'unknown'
  domains: DomainAssessment[]  // 10 domains, each with status, findings, recommendations
  criticalIssues: string[]
  recommendations: string[]
  conclusion: string
  createdAt: string
}
```

### LLM Prompt Engineering

The core analyzer ([src/lib/analyzer.ts](src/lib/analyzer.ts#L88-L221)) sends a detailed prompt to GPT-4o that:
- Provides repository metadata (files, languages, presence of package.json, tests, CI/CD, etc.)
- Includes excerpts of key files (package.json, README, requirements.txt)
- Requests structured JSON response with all 10 domains evaluated
- All responses must be in Arabic

**Important:** The LLM call expects the response to be valid JSON. Error handling creates a fallback report if JSON parsing fails.

## File Organization

```
src/
├── App.tsx                 # Main component, orchestrates analysis flow
├── main.tsx               # React entry point, ErrorBoundary setup
├── ErrorFallback.tsx      # Error boundary UI
├── components/
│   ├── AnalysisForm.tsx   # URL input form with validation
│   ├── ReportView.tsx     # Display generated report (accordion layout)
│   ├── ReportHistory.tsx  # Sidebar with past reports
│   ├── StatusBadge.tsx    # Color-coded status badges
│   └── ui/                # shadcn/ui components (button, card, accordion, etc.)
├── lib/
│   ├── analyzer.ts        # Core analysis engine & LLM integration
│   ├── github.ts          # GitHub API utilities & URL parsing
│   └── utils.ts           # Utility functions (cn for classnames)
├── hooks/
│   └── use-mobile.ts      # Mobile detection hook
├── types/
│   └── report.ts          # TypeScript interfaces for reports
└── styles/
    └── theme.css          # Custom theme variables
```

## Important Implementation Notes

### GitHub Spark Framework Requirements

1. **DO NOT** remove Spark Vite plugins from [vite.config.ts](vite.config.ts):
   - `createIconImportProxy()` - proxies Phosphor icon imports
   - `sparkPlugin()` - provides LLM runtime capabilities

2. **LLM API Usage:**
   - Use template literals with `spark.llmPrompt` for prompts
   - Call `spark.llm(prompt, 'gpt-4o', true)` for generation
   - The third parameter enables JSON mode

3. **Storage:**
   - `useKV<T>(key, defaultValue)` provides persistent storage
   - Changes to the value auto-save
   - Data persists across sessions

### Styling Conventions

- **Tailwind v4** (not v3) - uses new `@tailwindcss/vite` plugin
- Color system uses OKLCH values defined in theme
- Primary colors: Deep blue (`oklch(0.45 0.15 240)`)
- Accent: Warm orange (`oklch(0.65 0.18 30)`)
- Components use `class-variance-authority` for variant handling
- Utility function `cn()` in [src/lib/utils.ts](src/lib/utils.ts) merges classnames

### Forms & Validation

- React Hook Form for form state management
- Zod schemas for validation (though not heavily used in current implementation)
- URL validation in [github.ts](src/lib/github.ts#L1-L32) accepts:
  - Full URLs: `https://github.com/owner/repo`
  - Short format: `owner/repo`
  - Strips `.git` suffix

### Error Handling

- Top-level ErrorBoundary in [main.tsx](main.tsx#L14)
- Async errors handled in try-catch with user-friendly Arabic messages
- Toast notifications via `sonner` library
- GitHub API errors differentiate 404 (not found/private) from other failures

## Testing & Production Readiness

**Current Status (per TODO.md):**
- ❌ No tests yet - needs Vitest setup
- ❌ No Docker configuration
- ❌ No CI/CD pipeline
- ❌ README.md is empty

**Planned Infrastructure:**
- Multi-stage Dockerfile (Node build → Nginx serve)
- nginx.conf with SPA routing, security headers, gzip
- GitHub Actions CI workflow
- Vitest + React Testing Library for tests

## Common Development Patterns

**Adding a new UI component:**
1. Use shadcn CLI or manually add to [src/components/ui/](src/components/ui/)
2. Import with `@/components/ui/component-name` alias
3. Customize styling while maintaining accessibility from Radix primitives

**Modifying the LLM prompt:**
1. Edit the template literal in [src/lib/analyzer.ts](src/lib/analyzer.ts#L88-L221)
2. Ensure JSON structure matches TypeScript types in [src/types/report.ts](src/types/report.ts)
3. Test with various repository types (has/doesn't have tests, Docker, etc.)

**Adding new report domains:**
1. Update the LLM prompt to include new domain
2. Ensure TypeScript types accommodate changes
3. Update ReportView rendering logic if needed

## Build Configuration

- TypeScript target: ES2020
- Module resolution: bundler mode (Vite)
- JSX: React 17+ automatic runtime (`jsx: "react-jsx"`)
- Build output: `dist/` (default Vite behavior)
- Path aliases defined in both tsconfig and Vite config (keep in sync)

## Design System

**Typography (Arabic-first):**
- Headings: Cairo Bold/SemiBold
- Body: Cairo Regular
- Code/URLs: JetBrains Mono

**Component States:**
- Status badges: Green (ready), Yellow (conditional), Red (not-ready), Gray (unknown)
- Buttons have hover, active, disabled, loading states
- Cards use subtle shadows and rounded borders

**Animations:**
- Framer Motion for page-level animations (header fade-in)
- Loading states show spinners
- Smooth transitions between analysis states

## Known Limitations

- Only analyzes public GitHub repositories
- Requires GitHub Spark runtime environment
- LLM analysis quality depends on repository having well-documented files
- Reports are stored in browser storage (Spark KV) - not backed up to server
- Arabic-only interface (no i18n support for other languages)
