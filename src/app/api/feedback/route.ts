import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatDateString } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const vendorId = searchParams.get('vendor_id')
    const weekStartParam = searchParams.get('week_start')

    if (!vendorId || !weekStartParam) {
      return NextResponse.json(
        { error: 'vendor_id and week_start are required' },
        { status: 400 }
      )
    }

    const weekStart = new Date(weekStartParam)
    const weekStartStr = formatDateString(weekStart)

    // Fetch ALL feedback for this vendor and week (from all users)
    const feedback = await prisma.weeklyReportFeedback.findMany({
      where: {
        vendorId,
        weekStart: new Date(weekStartStr),
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vendor_id, week_start, user_id, user_name, feedback_html } = body

    if (!vendor_id || !week_start || !user_id || !user_name || !feedback_html) {
      return NextResponse.json(
        { error: 'vendor_id, week_start, user_id, user_name, and feedback_html are required' },
        { status: 400 }
      )
    }

    const weekStart = new Date(week_start)
    const weekStartStr = formatDateString(weekStart)

    // Check if feedback already exists for this vendor, week, and user
    const existing = await prisma.weeklyReportFeedback.findFirst({
      where: {
        vendorId: vendor_id,
        weekStart: new Date(weekStartStr),
        userId: user_id,
      },
    })

    let feedback
    if (existing) {
      // Update existing feedback from this user
      feedback = await prisma.weeklyReportFeedback.update({
        where: { id: existing.id },
        data: {
          userName: user_name,
          feedbackHtml: feedback_html,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new feedback for this user
      feedback = await prisma.weeklyReportFeedback.create({
        data: {
          vendorId: vendor_id,
          weekStart: new Date(weekStartStr),
          userId: user_id,
          userName: user_name,
          feedbackHtml: feedback_html,
        },
      })
    }

    return NextResponse.json({ feedback }, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('Error saving feedback:', error)
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    )
  }
}
