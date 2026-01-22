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

    // Fetch all active vendors included in weekly reports with their delivery managers and latest report
    const vendors = await prisma.vendor.findMany({
      where: {
        status: 'active',
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
