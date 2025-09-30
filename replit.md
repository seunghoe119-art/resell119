# Used Goods Listing Generator (중고 판매글 생성 도우미)

## Overview

This is a web application for creating and managing used goods listing posts in Korean. Users can input product details through a form interface, preview formatted listings in real-time, save them to a database, and retrieve saved listings for editing or reference. The application features AI-powered draft generation using OpenAI's GPT-4o model to automatically create initial listing content. It uses a split-pane interface with form inputs on the left and live preview on the right, optimized for Korean text and dark mode usage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: wouter for client-side routing (lightweight React Router alternative)

**State Management**: 
- React hooks for local component state
- TanStack Query (React Query) for server state management and data fetching
- No global state management library; data flows through props and query cache

**UI Component Library**: shadcn/ui built on Radix UI primitives
- Provides accessible, customizable components
- Tailwind CSS for styling with dark mode priority
- Custom design system defined in `design_guidelines.md` optimized for Korean typography

**Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

**Key Pages**:
- `GeneratorPage` (`/`): Split-pane interface for creating/editing listings with form and preview
  - Features AI draft generation form (`AiDraftForm`) for automated content creation
  - Real-time preview updates as form fields are modified
- `SavedPage` (`/saved`): List view of all saved listings

**Design System**: 
- Dark-first color palette with high contrast for extended use
- Korean-optimized typography using Noto Sans KR
- Utility-based Tailwind classes with custom CSS variables
- Responsive design considerations for mobile breakpoints

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**Language**: TypeScript compiled to ESM modules

**API Structure**: RESTful endpoints under `/api` prefix
- `GET /api/posts` - Fetch all posts
- `GET /api/posts/:id` - Fetch single post
- `POST /api/posts` - Create new post
- `PATCH /api/posts/:id` - Update existing post
- `POST /api/generate-draft` - Generate AI-powered listing draft using OpenAI GPT-4o

**Validation**: Zod schemas shared between client and server via `shared/schema.ts`

**Development Mode**: Vite middleware integration for HMR and SSR during development

**Production Build**: 
- Client built with Vite to `dist/public`
- Server bundled with esbuild to `dist/index.js`

### Data Storage

**ORM**: Drizzle ORM for type-safe database operations

**Database**: PostgreSQL (configured for deployment, uses Neon serverless driver)

**Schema** (`shared/schema.ts`):
- Single `posts` table with fields for product details:
  - Basic info: productName, brand
  - Condition: purchaseDate, usageCount, condition, additionalDescription
  - Accessories: basicAccessories (array), otherAccessories
  - Pricing: originalPrice, sellingPrice, negotiable
  - Transaction: transactionMethods (array), directLocation
  - Metadata: id (UUID), createdAt

**Storage Layer** (`server/storage.ts`):
- `IStorage` interface defining CRUD operations
- `DbStorage` class implementing interface with Drizzle queries
- Exported singleton instance for dependency injection pattern

**Migration Strategy**: Drizzle Kit with migrations in `./migrations` directory

### Key Design Decisions

**Monorepo Structure**: Client and server in single repository with shared types
- Rationale: Simplifies type sharing and deployment
- Trade-off: Larger bundle size but better type safety

**Split-Pane Interface**: Real-time preview alongside form input
- Rationale: Immediate feedback reduces cognitive load for Korean text formatting
- Implementation: State flows from form → preview pane via props

**Query-Based State Management**: TanStack Query for server state
- Rationale: Automatic caching, refetching, and loading states
- Alternative considered: Manual fetch with useState (rejected for boilerplate)
- Pro: Declarative data fetching with built-in error handling
- Con: Learning curve for complex query invalidation patterns

**Zod for Validation**: Single source of truth for data schemas
- Rationale: Share validation between client (forms) and server (API)
- Generated via `drizzle-zod` from database schema

**TypeScript Paths**: Aliases (@, @shared) for cleaner imports
- Configured in `tsconfig.json` and `vite.config.ts`

**Dark Mode First**: Design system prioritizes dark theme
- Rationale: Reduces eye strain during extended listing creation sessions
- Implementation: CSS variables in `index.css` with `.dark` class applied by default

## External Dependencies

### Database Services

**Neon Postgres**: Serverless PostgreSQL database
- Connection via `@neondatabase/serverless` driver
- Connection string expected in `DATABASE_URL` environment variable
- Alternative: Any PostgreSQL-compatible database can be used

### UI Component Libraries

**Radix UI**: Headless accessible components (@radix-ui/react-*)
- Provides primitives for dialogs, dropdowns, form controls, etc.
- No styling opinions; styled via Tailwind

**shadcn/ui**: Pre-built component library built on Radix
- Configuration in `components.json`
- Components live in `client/src/components/ui/`
- Uses "new-york" style variant

### Build and Development Tools

**Vite**: Frontend build tool and dev server
- HMR in development
- Static asset optimization in production
- Custom plugins for Replit integration (@replit/vite-plugin-*)

**Drizzle Kit**: Database migration and schema management tool
- Introspection and migration generation
- Push command for schema sync during development

### Styling

**Tailwind CSS**: Utility-first CSS framework
- Custom color palette defined via CSS variables
- Dark mode support via `class` strategy
- PostCSS for processing

**Fonts**: Google Fonts CDN
- Noto Sans KR: Primary font for Korean text
- JetBrains Mono: Monospace font for preview area

### Form Management

**React Hook Form**: Form state and validation
- Integrates with Zod via @hookform/resolvers
- Minimal re-renders for performance

**date-fns**: Date formatting and manipulation
- Korean locale support (`ko`) for relative time display

### Utilities

**clsx + tailwind-merge**: Conditional className composition
- Combined in `cn()` utility function (`lib/utils.ts`)

**class-variance-authority**: Type-safe variant styling for components

**nanoid**: Unique ID generation (used in toast system)

### AI Integration

**OpenAI GPT-4o**: AI-powered listing draft generation
- Model: gpt-4o (changed from gpt-5 for availability)
- Integration via axios HTTP client (not OpenAI SDK due to encoding issues with Korean text)
- API key management via Replit Secrets (`OPENAI_API_KEY`)
- Security: API key sanitized before use, error logging without sensitive data exposure
- Error handling: Specific user-friendly messages for common failures (rate limits, timeouts, auth errors)
- Timeout: 30 seconds for API requests
- Response format: JSON mode for structured output in Korean

**Implementation** (`server/openai.ts`):
- `generateListingDraft()` function takes product info and returns complete draft
- Axios used instead of OpenAI SDK to avoid ByteString encoding issues with Korean characters
- Proper error sanitization to prevent API key leakage in logs
- Custom error propagation with status codes for client-friendly error messages