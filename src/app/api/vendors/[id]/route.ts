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
