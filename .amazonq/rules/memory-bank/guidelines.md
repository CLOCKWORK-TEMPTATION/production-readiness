# Production Readiness Analyzer - Development Guidelines

## Code Quality Standards

### TypeScript Implementation Patterns
- **Strict Type Safety**: All files use TypeScript with strict mode enabled
- **Interface Definitions**: Complex objects use explicit interfaces (e.g., `ProductionReport`, `SidebarContextProps`)
- **Generic Type Usage**: Custom hooks leverage generics for reusability (`useKV<T>`)
- **Optional Chaining**: Defensive programming with optional chaining (`data.candidates?.[0]?.content?.parts?.[0]?.text`)
- **Type Guards**: Runtime type validation before operations
- **Union Types**: Status enums use union types (`"ready" | "conditional" | "not-ready" | "unknown"`)

### Component Architecture Standards
- **Functional Components**: All React components use function declarations
- **Custom Hook Pattern**: Business logic extracted to custom hooks (`useSidebar`, `useKV`)
- **Compound Component Pattern**: Complex UI components split into sub-components (Sidebar family)
- **Prop Interface Definitions**: All component props explicitly typed with interfaces
- **Forward Ref Pattern**: UI components support ref forwarding for accessibility
- **Conditional Rendering**: Extensive use of conditional rendering with proper null checks

### Error Handling Patterns
- **Try-Catch Blocks**: All async operations wrapped in try-catch with proper error logging
- **Error Boundaries**: React Error Boundary implementation for component-level error handling
- **Graceful Degradation**: Fallback values and default states for missing data
- **User-Friendly Messages**: Error messages localized and user-appropriate
- **Logging Integration**: Structured logging with different severity levels
- **API Error Distinction**: Separate handling for client vs server errors

## Structural Conventions

### File Organization Standards
- **Feature-Based Structure**: Components grouped by functionality rather than type
- **Index Exports**: Barrel exports for clean import statements
- **Test Co-location**: Test files placed adjacent to source files with `.test.tsx` suffix
- **Type Definitions**: Centralized type definitions in dedicated `types/` directory
- **Utility Separation**: Pure functions separated into `utils/` and `lib/` directories

### Naming Conventions
- **PascalCase Components**: React components use PascalCase (`AnalysisForm`, `ReportView`)
- **camelCase Functions**: Functions and variables use camelCase (`handleAnalyze`, `parseGitHubUrl`)
- **kebab-case Files**: File names use kebab-case for consistency (`analysis-form.tsx`)
- **Descriptive Naming**: Function names clearly describe their purpose (`announceToScreenReader`)
- **Constant Naming**: Constants use SCREAMING_SNAKE_CASE (`SIDEBAR_COOKIE_NAME`)

### Import/Export Patterns
- **Named Exports**: Prefer named exports over default exports for better tree-shaking
- **Grouped Imports**: External libraries, internal modules, and relative imports grouped separately
- **Alias Usage**: Path aliases (`@/`) used consistently for cleaner imports
- **Barrel Exports**: Complex modules export through index files

## Textual Standards

### Documentation Practices
- **JSDoc Comments**: Complex functions documented with JSDoc syntax
- **Inline Comments**: Critical business logic explained with inline comments
- **README Completeness**: Comprehensive README with setup, deployment, and usage instructions
- **API Documentation**: Server endpoints documented with purpose and parameters
- **Type Documentation**: Complex types documented with usage examples

### Code Comments Standards
- **Purpose Over Implementation**: Comments explain why, not what
- **Arabic Language Support**: User-facing text supports Arabic with proper RTL handling
- **Accessibility Labels**: ARIA labels and screen reader text properly implemented
- **Error Message Localization**: Error messages available in appropriate languages

## Practices Followed Throughout Codebase

### Security Implementation
- **API Key Protection**: Sensitive keys never exposed to client-side code
- **CORS Configuration**: Strict CORS policies with environment-specific origins
- **CSP Headers**: Content Security Policy implemented via Helmet middleware
- **Input Validation**: All user inputs validated before processing
- **Environment Variables**: Sensitive configuration managed through environment variables

### Performance Optimization
- **Lazy Loading**: Components and routes loaded on demand where appropriate
- **Memoization**: React.useMemo and useCallback used for expensive operations
- **Bundle Optimization**: Tree shaking and code splitting implemented
- **Asset Optimization**: Images and static assets optimized for web delivery
- **Caching Strategies**: Appropriate caching headers and localStorage usage

### Accessibility Compliance
- **ARIA Attributes**: Comprehensive ARIA labeling for screen readers
- **Keyboard Navigation**: Full keyboard accessibility with focus management
- **Color Contrast**: Proper color contrast ratios maintained
- **Touch Targets**: Mobile touch targets meet minimum size requirements
- **Screen Reader Support**: Announcements and live regions properly implemented

### Testing Standards
- **Unit Test Coverage**: Components have corresponding unit tests
- **User Event Testing**: Tests simulate real user interactions
- **Accessibility Testing**: Automated accessibility checks integrated
- **Mock Implementation**: External dependencies properly mocked in tests
- **Test Descriptions**: Test cases clearly describe expected behavior

## Semantic Patterns Overview

### State Management Patterns
- **Local Storage Integration**: Custom hook pattern for persistent state (`useKV`)
- **Controlled Components**: Form inputs managed through controlled component pattern
- **State Lifting**: Shared state lifted to appropriate parent components
- **Effect Dependencies**: useEffect dependencies properly managed to prevent infinite loops

### API Integration Patterns
- **Proxy Server Pattern**: Backend proxy protects API keys and handles CORS
- **Error Response Handling**: Consistent error response structure across API endpoints
- **Request Validation**: Server-side validation of all incoming requests
- **Response Transformation**: API responses transformed to match frontend expectations

### UI/UX Patterns
- **Loading States**: Comprehensive loading indicators for async operations
- **Toast Notifications**: User feedback through toast notification system
- **Progressive Enhancement**: Features work without JavaScript where possible
- **Responsive Design**: Mobile-first responsive design implementation

### Data Flow Patterns
- **Unidirectional Data Flow**: Props down, events up pattern consistently followed
- **Immutable Updates**: State updates use immutable patterns
- **Derived State**: Computed values derived from primary state rather than duplicated
- **Event Handling**: Event handlers properly bound and cleaned up

## Internal API Usage Patterns

### Custom Hook Implementation
```typescript
// Pattern: Generic custom hook with localStorage persistence
function useKV<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Implementation with error handling and type safety
}
```

### Component Composition Pattern
```typescript
// Pattern: Compound component with context
const SidebarContext = createContext<SidebarContextProps | null>(null)
function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}
```

### Error Handling Pattern
```typescript
// Pattern: Comprehensive error handling with user feedback
try {
  const result = await apiCall()
  // Success handling
} catch (err) {
  logger.error('Operation failed:', err)
  const errorMessage = err instanceof Error ? err.message : 'Default message'
  toast.error(errorMessage)
}
```

## Frequently Used Code Idioms

### Conditional Rendering with Safety
```typescript
{reports?.length > 0 ? (
  reports.map(report => <Component key={report.id} />)
) : (
  <EmptyState />
)}
```

### Event Handler Pattern
```typescript
const handleAction = useCallback(async (param: string) => {
  setLoading(true)
  try {
    await performAction(param)
    toast.success('Success message')
  } catch (error) {
    handleError(error)
  } finally {
    setLoading(false)
  }
}, [dependencies])
```

### Component Props with Variants
```typescript
interface ComponentProps extends ComponentProps<"div"> {
  variant?: "default" | "outline"
  size?: "sm" | "md" | "lg"
  asChild?: boolean
}
```

## Popular Annotations

### TypeScript Annotations
- `React.FC<Props>`: Function component type annotation
- `ComponentProps<"element">`: Extending native element props
- `VariantProps<typeof variants>`: Type-safe variant props from CVA
- `@param` and `@returns`: JSDoc parameter and return documentation

### Testing Annotations
- `describe()`: Test suite grouping
- `beforeEach()`: Test setup functions
- `vi.fn()`: Vitest mock function creation
- `expect().toBeInTheDocument()`: DOM presence assertions

### Accessibility Annotations
- `aria-label`: Screen reader labels
- `data-testid`: Testing identifiers
- `role`: ARIA role definitions
- `tabIndex`: Keyboard navigation control