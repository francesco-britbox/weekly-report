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
