# Weekly Report Viewer - Implementation Plan

## Overview

This document outlines the implementation plan for converting the POC weekly report viewer into a dynamic, database-driven web application. The new application will be a read-only viewer that fetches data from the existing Vendor Manager PostgreSQL database.

## Project Summary

| Attribute | Value |
|-----------|-------|
| **Project Name** | Weekly Report Viewer |
| **Location** | `/weekly-report/app` |
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + CSS Variables |
| **Database** | PostgreSQL (shared with Vendor Manager) |
| **ORM** | Prisma |
| **Deployment** | Docker |
| **Port** | 3001 |

## Architecture

The application follows a simple read-only architecture:

```
┌─────────────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│   Vendor Manager App    │────▶│   PostgreSQL DB   │◀────│   Weekly Report App   │
│   (Admin - Data Entry)  │     │   (Shared)        │     │   (Read-Only Viewer)  │
│   Port: 3000            │     │   Port: 5432      │     │   Port: 3001          │
└─────────────────────────┘     └──────────────────┘     └──────────────────────┘
```

See [architecture.md](./docs/architecture.md) for detailed technical decisions.

## Implementation Phases

The implementation is divided into 4 phases, each designed to be self-contained and incrementally buildable.

### Phase 1: Project Setup & Docker Configuration
**Estimated Complexity: Low**

Set up the Next.js project structure, Docker configuration, and basic infrastructure.

**Deliverables:**
- Next.js 15 project with TypeScript
- Tailwind CSS configuration with design tokens from POC
- Docker and Docker Compose configuration
- Basic project structure

**Document:** [phase-1-project-setup.md](./docs/phase-1-project-setup.md)

---

### Phase 2: Database Integration & API Layer
**Estimated Complexity: Medium**

Connect to the existing database and create read-only API endpoints.

**Deliverables:**
- Prisma schema (referencing existing tables)
- Read-only API routes for:
  - `/api/vendors` - List all vendors with basic info
  - `/api/vendors/[id]` - Full vendor data (timeline, RAID, resources)
  - `/api/report` - Weekly report data for all vendors
  - `/api/weeks` - Week navigation data
- TypeScript types matching existing data structures

**Document:** [phase-2-database-and-api.md](./docs/phase-2-database-and-api.md)

---

### Phase 3: Frontend Components
**Estimated Complexity: High**

Build all React components to match the POC exactly.

**Deliverables:**
- Layout components (Header, Container)
- VendorTabs component
- DeliveryTimeline component with milestone nodes
- WeeklyStatus component (Achievements + Focus)
- RaidLog component with filters
- Resources component
- MilestoneModal component
- WeekNavigation component

**Document:** [phase-3-frontend-components.md](./docs/phase-3-frontend-components.md)

---

### Phase 4: Integration & Polish
**Estimated Complexity: Medium**

Wire everything together, add loading states, error handling, and final polish.

**Deliverables:**
- Main page integration
- Data fetching with SWR or React Query
- Loading skeletons
- Error states
- Week navigation functionality
- Final CSS polish and animations
- Docker production build verification

**Document:** [phase-4-integration-and-polish.md](./docs/phase-4-integration-and-polish.md)

---

## Data Mapping

The POC hardcoded data maps to existing database tables as follows:

| POC Data | Database Table | Notes |
|----------|----------------|-------|
| `vendors[].id` | `vendors.id` | Direct mapping |
| `vendors[].name` | `vendors.name` | Direct mapping |
| `vendors[].owner` | `users.name` via `delivery_manager_vendors` | Join through assignment table |
| `vendors[].rag` | `weekly_reports.ragStatus` | From latest weekly report |
| `vendors[].timeline` | `vendor_timelines` | Vendor-level persistent data |
| `vendors[].achievements` | `weekly_report_achievements` | Linked via weekly_reports |
| `vendors[].focus` | `weekly_report_focus` | Linked via weekly_reports |
| `vendors[].raid` | `vendor_raid_items` | Vendor-level persistent data |
| `vendors[].resources` | `vendor_resources` | Vendor-level persistent data |

## File Structure

```
weekly-report/app/
├── docs/
│   ├── architecture.md
│   ├── phase-1-project-setup.md
│   ├── phase-2-database-and-api.md
│   ├── phase-3-frontend-components.md
│   └── phase-4-integration-and-polish.md
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── vendors/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── report/route.ts
│   │   │   └── weeks/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── header.tsx
│   │   ├── vendor-tabs.tsx
│   │   ├── delivery-timeline.tsx
│   │   ├── weekly-status.tsx
│   │   ├── raid-log.tsx
│   │   ├── resources.tsx
│   │   ├── milestone-modal.tsx
│   │   └── week-navigation.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma
├── public/
│   └── images/
│       └── logo.png
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Design Tokens

The POC uses specific BritBox brand colors. These will be implemented as CSS variables and Tailwind theme extensions:

```css
:root {
  --bg-primary: #00182b;
  --bg-secondary: #001f38;
  --bg-card: #002847;
  --bg-card-hover: #003356;
  --text-primary: #ffffff;
  --text-secondary: #8ba3b8;
  --text-muted: #5a7a94;
  --accent-cyan: #a8dce8;
  --rag-green: #34c759;
  --rag-amber: #ff9f0a;
  --rag-red: #ff453a;
  --border-color: #1a3a52;
  --timeline-line: #3a5a72;
}
```

## Success Criteria

1. **Visual Parity**: The app looks identical to the POC
2. **Functional Parity**: All interactions work the same (vendor switching, filters, modal, week navigation)
3. **Data Accuracy**: Correctly displays data from the database
4. **Docker Ready**: Runs in Docker alongside the vendor manager
5. **Read-Only**: No ability to modify data (no authentication required)

## Dependencies on Vendor Manager

This application depends on:
1. The PostgreSQL database being accessible
2. Data existing in the weekly reporting tables
3. The database schema remaining stable

## Getting Started

After approval of this plan, implementation will proceed in order:
1. Phase 1: Project Setup
2. Phase 2: Database & API
3. Phase 3: Frontend Components
4. Phase 4: Integration & Polish

Each phase can be verified independently before moving to the next.
