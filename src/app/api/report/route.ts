import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VendorStatus } from '@prisma/client'
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

    // Fetch all active vendors included in weekly reports with their data
    const vendors = await prisma.vendor.findMany({
      where: {
        status: VendorStatus.active,
        includeInWeeklyReports: true,
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
