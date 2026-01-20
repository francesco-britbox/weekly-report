# Phase 2: Database Integration & API Layer

## Overview

This phase connects the application to the existing PostgreSQL database and creates read-only API endpoints to serve data to the frontend.

## Prerequisites

- Phase 1 completed
- Access to the existing vendor-manager database
- Database URL available

## Tasks

### 2.1 Create Prisma Schema

Create a read-only Prisma schema that references the existing database tables. This schema is a subset focused on what the report viewer needs.

```prisma
// prisma/schema.prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x", "debian-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model (read-only, for delivery manager names)
model User {
  id                     String                  @id @default(cuid())
  name                   String
  deliveryManagerVendors DeliveryManagerVendor[]

  @@map("users")
}

// Vendor model
model Vendor {
  id        String @id @default(cuid())
  name      String
  status    String @default("active")
  createdAt DateTime @default(now())

  // Relationships
  weeklyReports          WeeklyReport[]
  timeline               VendorTimeline[]
  raidItems              VendorRaidItem[]
  resources              VendorResource[]
  deliveryManagerVendors DeliveryManagerVendor[]

  @@index([name])
  @@index([status])
  @@map("vendors")
}

// Junction table for delivery manager to vendor assignment
model DeliveryManagerVendor {
  id        String   @id @default(cuid())
  userId    String
  vendorId  String
  createdAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  vendor Vendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@unique([userId, vendorId])
  @@index([userId])
  @@index([vendorId])
  @@map("delivery_manager_vendors")
}

// Weekly report model
model WeeklyReport {
  id          String    @id @default(cuid())
  vendorId    String
  weekStart   DateTime  @db.Date
  ragStatus   String?   @db.VarChar(10)
  status      String    @default("draft") @db.VarChar(20)
  submittedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  vendor       Vendor                    @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  achievements WeeklyReportAchievement[]
  focusItems   WeeklyReportFocus[]

  @@unique([vendorId, weekStart])
  @@index([vendorId, weekStart])
  @@map("weekly_reports")
}

// Achievements for weekly reports
model WeeklyReportAchievement {
  id          String   @id @default(cuid())
  reportId    String
  description String   @db.Text
  status      String?  @db.VarChar(20)
  isFromFocus Boolean  @default(false)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  report WeeklyReport @relation(fields: [reportId], references: [id], onDelete: Cascade)

  @@index([reportId])
  @@map("weekly_report_achievements")
}

// Focus items for weekly reports
model WeeklyReportFocus {
  id            String   @id @default(cuid())
  reportId      String
  description   String   @db.Text
  isCarriedOver Boolean  @default(false)
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  report WeeklyReport @relation(fields: [reportId], references: [id], onDelete: Cascade)

  @@index([reportId])
  @@map("weekly_report_focus")
}

// Vendor timeline milestones
model VendorTimeline {
  id        String   @id @default(cuid())
  vendorId  String
  date      String   @db.VarChar(50)
  title     String
  status    String   @db.VarChar(20)
  platforms String[]
  features  String[]
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  vendor Vendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@index([vendorId])
  @@map("vendor_timelines")
}

// RAID log items
model VendorRaidItem {
  id          String   @id @default(cuid())
  vendorId    String
  type        String   @db.VarChar(20)
  area        String
  description String   @db.Text
  impact      String   @db.VarChar(10)
  owner       String?
  ragStatus   String   @db.VarChar(10)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  vendor Vendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@index([vendorId])
  @@map("vendor_raid_items")
}

// Vendor resources/links
model VendorResource {
  id          String   @id @default(cuid())
  vendorId    String
  type        String   @db.VarChar(20)
  name        String
  description String?  @db.Text
  url         String
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  vendor Vendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@index([vendorId])
  @@map("vendor_resources")
}
```

### 2.2 Create Prisma Client Singleton

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 2.3 Create TypeScript Types

```typescript
// src/types/index.ts

// RAG Status type
export type RAGStatus = 'green' | 'amber' | 'red'

// Timeline milestone status
export type TimelineStatus = 'completed' | 'in_progress' | 'upcoming' | 'tbc'

// Achievement status
export type AchievementStatus = 'done' | 'in_progress' | null

// RAID item type
export type RaidType = 'risk' | 'issue' | 'dependency'

// Impact level
export type ImpactLevel = 'high' | 'medium' | 'low'

// Resource type
export type ResourceType = 'confluence' | 'jira' | 'github' | 'docs'

// Achievement item
export interface Achievement {
  id: string
  description: string
  status: AchievementStatus
  sortOrder: number
}

// Focus item
export interface FocusItem {
  id: string
  description: string
  sortOrder: number
}

// Timeline milestone
export interface TimelineMilestone {
  id: string
  date: string
  title: string
  status: TimelineStatus
  platforms: string[]
  features: string[]
  sortOrder: number
}

// RAID log item
export interface RaidItem {
  id: string
  type: RaidType
  area: string
  description: string
  impact: ImpactLevel
  owner: string | null
  ragStatus: RAGStatus
  sortOrder: number
}

// Resource item
export interface ResourceItem {
  id: string
  type: ResourceType
  name: string
  description: string | null
  url: string
  sortOrder: number
}

// Vendor for the list view
export interface VendorSummary {
  id: string
  name: string
  owner: string | null
  ragStatus: RAGStatus | null
}

// Full vendor data
export interface VendorData {
  id: string
  name: string
  owner: string | null
  ragStatus: RAGStatus | null
  timeline: TimelineMilestone[]
  achievements: Achievement[]
  focus: FocusItem[]
  raid: RaidItem[]
  resources: ResourceItem[]
}

// Full report data
export interface ReportData {
  reportDate: string
  weekStart: string
  generatedAt: string
  vendors: VendorData[]
}

// Week navigation
export interface WeekOption {
  weekStart: string
  label: string
}

export interface WeeksResponse {
  year: number
  month: number
  weeks: WeekOption[]
}
```

### 2.4 Create Utility Functions

```typescript
// src/lib/utils.ts
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameDay } from 'date-fns'

/**
 * Get the Monday of the week containing a given date
 */
export function getMondayOfWeek(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }) // 1 = Monday
}

/**
 * Format a date as YYYY-MM-DD
 */
export function formatDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Format a date for display in the header (e.g., "16th January 2026")
 */
export function formatReportDate(date: Date): string {
  const day = date.getDate()
  const suffix = getOrdinalSuffix(day)
  return `${day}${suffix} ${format(date, 'MMMM yyyy')}`
}

/**
 * Get ordinal suffix for a day number
 */
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

/**
 * Get all weeks (as Monday dates) for a given month
 */
export function getWeeksInMonth(year: number, month: number): Date[] {
  const weeks: Date[] = []
  const firstDay = startOfMonth(new Date(year, month - 1)) // month is 0-indexed in Date
  const lastDay = endOfMonth(firstDay)

  let monday = getMondayOfWeek(firstDay)

  // Include weeks that have any overlap with this month
  while (monday <= lastDay) {
    const sunday = addDays(monday, 6)
    if (sunday >= firstDay) {
      weeks.push(new Date(monday))
    }
    monday = addDays(monday, 7)
  }

  return weeks
}

/**
 * Format a week label (e.g., "Week of Jan 6")
 */
export function formatWeekLabel(date: Date): string {
  return `Week of ${format(date, 'MMM d')}`
}

/**
 * Get the Friday of a week (typical report day)
 */
export function getFridayOfWeek(monday: Date): Date {
  return addDays(monday, 4)
}

/**
 * Check if two dates represent the same week
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const monday1 = getMondayOfWeek(date1)
  const monday2 = getMondayOfWeek(date2)
  return isSameDay(monday1, monday2)
}

/**
 * Combine class names (simple version of clsx)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
```

### 2.5 Create API Route: GET /api/vendors

List all active vendors with their current RAG status.

```typescript
// src/app/api/vendors/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMondayOfWeek, formatDateString } from '@/lib/utils'
import type { VendorSummary, RAGStatus } from '@/types'

export async function GET() {
  try {
    // Get the current week's Monday
    const today = new Date()
    const weekStart = getMondayOfWeek(today)
    const weekStartStr = formatDateString(weekStart)

    // Fetch all active vendors with their delivery managers and latest report
    const vendors = await prisma.vendor.findMany({
      where: {
        status: 'active',
      },
      include: {
        deliveryManagerVendors: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          take: 1, // Get first delivery manager
        },
        weeklyReports: {
          where: {
            weekStart: new Date(weekStartStr),
          },
          select: {
            ragStatus: true,
          },
          take: 1,
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    const vendorSummaries: VendorSummary[] = vendors.map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      owner: vendor.deliveryManagerVendors[0]?.user.name ?? null,
      ragStatus: (vendor.weeklyReports[0]?.ragStatus as RAGStatus) ?? null,
    }))

    return NextResponse.json({ vendors: vendorSummaries })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    )
  }
}
```

### 2.6 Create API Route: GET /api/vendors/[id]

Get full vendor data including timeline, RAID, and resources.

```typescript
// src/app/api/vendors/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMondayOfWeek, formatDateString } from '@/lib/utils'
import type {
  VendorData,
  TimelineMilestone,
  RaidItem,
  ResourceItem,
  Achievement,
  FocusItem,
  RAGStatus,
  TimelineStatus,
  RaidType,
  ImpactLevel,
  ResourceType,
  AchievementStatus,
} from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get week from query params or use current week
    const searchParams = request.nextUrl.searchParams
    const weekStartParam = searchParams.get('week_start')

    let weekStart: Date
    if (weekStartParam) {
      weekStart = new Date(weekStartParam)
    } else {
      weekStart = getMondayOfWeek(new Date())
    }
    const weekStartStr = formatDateString(weekStart)

    // Fetch vendor with all related data
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        deliveryManagerVendors: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          take: 1,
        },
        weeklyReports: {
          where: {
            weekStart: new Date(weekStartStr),
          },
          include: {
            achievements: {
              orderBy: { sortOrder: 'asc' },
            },
            focusItems: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          take: 1,
        },
        timeline: {
          orderBy: { sortOrder: 'asc' },
        },
        raidItems: {
          orderBy: { sortOrder: 'asc' },
        },
        resources: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    const report = vendor.weeklyReports[0]

    const vendorData: VendorData = {
      id: vendor.id,
      name: vendor.name,
      owner: vendor.deliveryManagerVendors[0]?.user.name ?? null,
      ragStatus: (report?.ragStatus as RAGStatus) ?? null,
      timeline: vendor.timeline.map((item): TimelineMilestone => ({
        id: item.id,
        date: item.date,
        title: item.title,
        status: item.status as TimelineStatus,
        platforms: item.platforms,
        features: item.features,
        sortOrder: item.sortOrder,
      })),
      achievements: (report?.achievements ?? []).map((item): Achievement => ({
        id: item.id,
        description: item.description,
        status: item.status as AchievementStatus,
        sortOrder: item.sortOrder,
      })),
      focus: (report?.focusItems ?? []).map((item): FocusItem => ({
        id: item.id,
        description: item.description,
        sortOrder: item.sortOrder,
      })),
      raid: vendor.raidItems.map((item): RaidItem => ({
        id: item.id,
        type: item.type as RaidType,
        area: item.area,
        description: item.description,
        impact: item.impact as ImpactLevel,
        owner: item.owner,
        ragStatus: item.ragStatus as RAGStatus,
        sortOrder: item.sortOrder,
      })),
      resources: vendor.resources.map((item): ResourceItem => ({
        id: item.id,
        type: item.type as ResourceType,
        name: item.name,
        description: item.description,
        url: item.url,
        sortOrder: item.sortOrder,
      })),
    }

    return NextResponse.json(vendorData)
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    )
  }
}
```

### 2.7 Create API Route: GET /api/report

Get the full report data for all vendors for a specific week.

```typescript
// src/app/api/report/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMondayOfWeek, formatDateString, getFridayOfWeek, formatReportDate } from '@/lib/utils'
import type {
  ReportData,
  VendorData,
  RAGStatus,
  TimelineStatus,
  RaidType,
  ImpactLevel,
  ResourceType,
  AchievementStatus,
} from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const weekStartParam = searchParams.get('week_start')

    let weekStart: Date
    if (weekStartParam) {
      weekStart = new Date(weekStartParam)
    } else {
      weekStart = getMondayOfWeek(new Date())
    }

    const weekStartStr = formatDateString(weekStart)
    const reportDate = getFridayOfWeek(weekStart)

    // Fetch all active vendors with their data
    const vendors = await prisma.vendor.findMany({
      where: {
        status: 'active',
      },
      include: {
        deliveryManagerVendors: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          take: 1,
        },
        weeklyReports: {
          where: {
            weekStart: new Date(weekStartStr),
          },
          include: {
            achievements: {
              orderBy: { sortOrder: 'asc' },
            },
            focusItems: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          take: 1,
        },
        timeline: {
          orderBy: { sortOrder: 'asc' },
        },
        raidItems: {
          orderBy: { sortOrder: 'asc' },
        },
        resources: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    const vendorsData: VendorData[] = vendors.map((vendor) => {
      const report = vendor.weeklyReports[0]

      return {
        id: vendor.id,
        name: vendor.name,
        owner: vendor.deliveryManagerVendors[0]?.user.name ?? null,
        ragStatus: (report?.ragStatus as RAGStatus) ?? null,
        timeline: vendor.timeline.map((item) => ({
          id: item.id,
          date: item.date,
          title: item.title,
          status: item.status as TimelineStatus,
          platforms: item.platforms,
          features: item.features,
          sortOrder: item.sortOrder,
        })),
        achievements: (report?.achievements ?? []).map((item) => ({
          id: item.id,
          description: item.description,
          status: item.status as AchievementStatus,
          sortOrder: item.sortOrder,
        })),
        focus: (report?.focusItems ?? []).map((item) => ({
          id: item.id,
          description: item.description,
          sortOrder: item.sortOrder,
        })),
        raid: vendor.raidItems.map((item) => ({
          id: item.id,
          type: item.type as RaidType,
          area: item.area,
          description: item.description,
          impact: item.impact as ImpactLevel,
          owner: item.owner,
          ragStatus: item.ragStatus as RAGStatus,
          sortOrder: item.sortOrder,
        })),
        resources: vendor.resources.map((item) => ({
          id: item.id,
          type: item.type as ResourceType,
          name: item.name,
          description: item.description,
          url: item.url,
          sortOrder: item.sortOrder,
        })),
      }
    })

    const reportData: ReportData = {
      reportDate: formatReportDate(reportDate),
      weekStart: weekStartStr,
      generatedAt: new Date().toISOString(),
      vendors: vendorsData,
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    )
  }
}
```

### 2.8 Create API Route: GET /api/weeks

Get week navigation data for a month.

```typescript
// src/app/api/weeks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getWeeksInMonth, formatWeekLabel, formatDateString } from '@/lib/utils'
import type { WeeksResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')

    if (!yearParam || !monthParam) {
      return NextResponse.json(
        { error: 'year and month parameters are required' },
        { status: 400 }
      )
    }

    const year = parseInt(yearParam, 10)
    const month = parseInt(monthParam, 10)

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid year or month' },
        { status: 400 }
      )
    }

    const weeks = getWeeksInMonth(year, month)

    const response: WeeksResponse = {
      year,
      month,
      weeks: weeks.map((monday) => ({
        weekStart: formatDateString(monday),
        label: formatWeekLabel(monday),
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error generating weeks:', error)
    return NextResponse.json(
      { error: 'Failed to generate weeks' },
      { status: 500 }
    )
  }
}
```

### 2.9 Generate Prisma Client

Run Prisma to generate the client and verify the schema:

```bash
# Generate Prisma client
npx prisma generate

# Verify connection (optional - pulls schema from DB)
npx prisma db pull --force
```

**Note:** Since we're connecting to an existing database, we use `db pull` to verify our schema matches. Do NOT run `prisma migrate` as that would modify the shared database.

## Verification Steps

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test API endpoints:**
   ```bash
   # Test vendors list
   curl http://localhost:3001/api/vendors

   # Test full report
   curl http://localhost:3001/api/report

   # Test specific vendor
   curl http://localhost:3001/api/vendors/[vendor-id]

   # Test weeks
   curl "http://localhost:3001/api/weeks?year=2026&month=1"
   ```

3. **Verify response structure:**
   - `/api/vendors` returns `{ vendors: [...] }`
   - `/api/report` returns full report data with all vendors
   - `/api/vendors/[id]` returns single vendor with all related data
   - `/api/weeks` returns week options for the given month

## Files Created

```
weekly-report/app/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   └── app/
│       └── api/
│           ├── vendors/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── route.ts
│           ├── report/
│           │   └── route.ts
│           └── weeks/
│               └── route.ts
```

## Success Criteria

- [ ] Prisma client generates without errors
- [ ] `/api/vendors` returns list of active vendors
- [ ] `/api/report` returns full report data
- [ ] `/api/vendors/[id]` returns vendor with timeline, RAID, resources
- [ ] `/api/weeks` returns correct week options
- [ ] Week filtering works with `?week_start=` parameter
- [ ] All data matches existing database structure

## Troubleshooting

### "Table does not exist" errors
- Verify `DATABASE_URL` points to the correct database
- Run `npx prisma db pull` to verify schema matches database

### Empty responses
- Check that data exists in the database for active vendors
- Verify the week being queried has data

### Connection errors
- Ensure PostgreSQL is running
- Check network connectivity (especially in Docker)
- Verify credentials in `DATABASE_URL`

## Next Phase

Proceed to [Phase 3: Frontend Components](./phase-3-frontend-components.md)
