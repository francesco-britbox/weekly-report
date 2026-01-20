# Architecture Specification

## Overview

This document defines the technical architecture for the Weekly Report Viewer application. The application is designed as a lightweight, read-only viewer that shares the database with the existing Vendor Manager application.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Docker Network                                  │
│                                                                             │
│  ┌─────────────────────┐   ┌──────────────────┐   ┌─────────────────────┐  │
│  │  Vendor Manager     │   │   PostgreSQL     │   │  Weekly Report      │  │
│  │  (Next.js)          │   │   Database       │   │  Viewer (Next.js)   │  │
│  │                     │   │                  │   │                     │  │
│  │  - CRUD operations  │──▶│  - vendors       │◀──│  - Read-only        │  │
│  │  - Authentication   │   │  - weekly_reports│   │  - No auth          │  │
│  │  - Data entry       │   │  - vendor_*      │   │  - Public viewer    │  │
│  │                     │   │  - ...           │   │                     │  │
│  │  Port: 3000         │   │  Port: 5432      │   │  Port: 3001         │  │
│  └─────────────────────┘   └──────────────────┘   └─────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                              ┌──────────────┐
                              │   Browser    │
                              │   (Client)   │
                              └──────────────┘
```

## Technology Choices

### Framework: Next.js 15 (App Router)

**Rationale:**
- Matches the Vendor Manager app stack for consistency
- App Router provides excellent server components support
- Built-in API routes for backend functionality
- Great TypeScript support
- Easy Docker deployment

### Styling: Tailwind CSS + CSS Variables

**Rationale:**
- The POC uses CSS variables for design tokens
- Tailwind allows rapid development while respecting the existing design system
- CSS variables enable runtime theming if needed later
- Easy to port exact styles from POC

### Database: Prisma (Read-Only)

**Rationale:**
- Type-safe database access
- Can share schema understanding with Vendor Manager
- Simple read queries without ORM overhead
- Good PostgreSQL support

### State Management: React Context + SWR

**Rationale:**
- Lightweight - no need for Redux/Zustand for a read-only app
- SWR provides caching and revalidation out of the box
- Context for UI state (selected vendor, selected week, filters)

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js    │────▶│   Prisma    │────▶│  PostgreSQL │
│             │     │  API Route  │     │   Client    │     │  Database   │
│  (React)    │◀────│             │◀────│             │◀────│             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │
      │  SWR Cache
      ▼
┌─────────────┐
│  Local      │
│  State      │
│  (Context)  │
└─────────────┘
```

### Request Flow

1. **Initial Load**: Browser requests the main page
2. **Server Render**: Next.js renders initial HTML with loading states
3. **Client Hydration**: React hydrates and SWR fetches data
4. **Data Fetch**: API routes query database via Prisma
5. **Cache**: SWR caches responses for fast subsequent renders
6. **User Interaction**: State changes (vendor selection, filters) trigger re-renders

## API Design

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/report` | GET | Full report data for all vendors for a week |
| `/api/vendors` | GET | List of all active vendors |
| `/api/vendors/[id]` | GET | Single vendor with all related data |
| `/api/weeks` | GET | Week navigation data for a month |

### Query Parameters

**`/api/report`**
- `week_start` (optional): ISO date string (YYYY-MM-DD) for Monday of the week. Defaults to current week.

**`/api/weeks`**
- `year` (required): Year number
- `month` (required): Month number (1-12)

### Response Caching

API responses can be cached at multiple levels:
- **SWR**: Client-side cache with stale-while-revalidate
- **Next.js**: Server-side caching with `revalidate` option
- **CDN**: Edge caching for static-like responses

Recommended cache times:
- `/api/report`: 60 seconds (data may change from admin app)
- `/api/vendors`: 300 seconds (vendor list rarely changes)
- `/api/weeks`: 86400 seconds (week calculations are static)

## Component Architecture

```
App (page.tsx)
├── Header
│   ├── Logo
│   └── ReportDate
├── VendorTabs
│   └── VendorTab (multiple)
│       ├── VendorInfo
│       └── RagIndicator
└── ContentWrapper
    ├── DeliveryTimeline
    │   ├── WeekNavigation
    │   │   ├── MonthNav
    │   │   ├── WeekSelect
    │   │   └── QuickFilters
    │   └── Timeline
    │       └── TimelineNode (multiple)
    ├── WeeklyStatus
    │   ├── AchievementsCard
    │   │   └── StatusItem (multiple)
    │   └── FocusCard
    │       └── StatusItem (multiple)
    ├── RaidLog
    │   ├── RaidFilters
    │   └── RaidTable
    │       └── RaidRow (multiple)
    └── Resources
        └── ResourceGrid
            └── ResourceItem (multiple)

MilestoneModal (portal)
├── ModalHeader
├── ModalPlatforms
└── ModalFeatures
```

## State Management

### Global State (React Context)

```typescript
interface AppState {
  // Data
  vendors: Vendor[];
  currentVendor: Vendor | null;

  // UI State
  selectedWeekStart: Date;
  currentMonth: Date;
  raidFilter: 'all' | 'issue' | 'risk' | 'dependency';
  isModalOpen: boolean;
  selectedMilestone: TimelineMilestone | null;

  // Loading States
  isLoading: boolean;
  error: Error | null;
}
```

### Local Component State

Some state remains local to components:
- Animation states
- Hover effects
- Dropdown open/closed states

## Database Schema (Read-Only)

The application reads from these existing tables:

```
vendors
├── id (PK)
├── name
└── status

weekly_reports
├── id (PK)
├── vendorId (FK → vendors)
├── weekStart
├── ragStatus
└── status

weekly_report_achievements
├── id (PK)
├── reportId (FK → weekly_reports)
├── description
├── status
└── sortOrder

weekly_report_focus
├── id (PK)
├── reportId (FK → weekly_reports)
├── description
└── sortOrder

vendor_timelines
├── id (PK)
├── vendorId (FK → vendors)
├── date
├── title
├── status
├── platforms[]
├── features[]
└── sortOrder

vendor_raid_items
├── id (PK)
├── vendorId (FK → vendors)
├── type
├── area
├── description
├── impact
├── owner
├── ragStatus
└── sortOrder

vendor_resources
├── id (PK)
├── vendorId (FK → vendors)
├── type
├── name
├── description
├── url
└── sortOrder

delivery_manager_vendors
├── userId (FK → users)
└── vendorId (FK → vendors)

users
├── id (PK)
└── name
```

## Docker Configuration

### Development

```yaml
# docker-compose.yml
services:
  weekly-report-viewer:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/vendor_manager
    depends_on:
      - db
    networks:
      - vendor-network

networks:
  vendor-network:
    external: true
```

### Production

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3001
ENV PORT 3001
CMD ["node", "server.js"]
```

## Security Considerations

### Read-Only Access

- All API routes only support GET requests
- No authentication required (public viewer)
- Database user should have SELECT-only permissions
- No sensitive data exposed (passwords, API keys, etc.)

### Database Connection

```sql
-- Recommended: Create a read-only database user
CREATE USER weekly_report_viewer WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE vendor_manager TO weekly_report_viewer;
GRANT USAGE ON SCHEMA public TO weekly_report_viewer;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO weekly_report_viewer;
```

### Input Validation

Even for read-only operations:
- Validate query parameters (date formats, IDs)
- Use parameterized queries via Prisma
- Sanitize any user input before display

## Performance Considerations

### Server-Side

1. **Database Queries**: Use efficient joins, select only needed fields
2. **Caching**: Implement response caching at API level
3. **Connection Pooling**: Use Prisma's built-in connection pooling

### Client-Side

1. **Code Splitting**: Lazy load modal component
2. **Image Optimization**: Use Next.js Image for logo
3. **CSS**: Use Tailwind's purge to minimize CSS bundle
4. **Animations**: Use CSS transforms for GPU acceleration

### Monitoring

Consider adding:
- Request timing logs
- Error tracking (Sentry or similar)
- Database query monitoring

## Error Handling

### API Errors

```typescript
// Standard error response format
interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
```

### Client Errors

- Loading states for all data fetches
- Error boundaries for component failures
- Fallback UI for missing data
- Retry logic in SWR configuration

## Future Considerations

While out of scope for initial implementation, the architecture supports:

1. **PDF Export**: Add a print-friendly CSS or PDF generation
2. **Email Delivery**: Scheduled report emails
3. **Filters/Search**: Additional filtering capabilities
4. **Compare Weeks**: Side-by-side week comparison
5. **Dark/Light Mode**: Theme switching (CSS variables already support this)
