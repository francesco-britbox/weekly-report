'use client'

import useSWR from 'swr'
import type { ReportData, WeeksResponse, VendorData } from '@/types'

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`)
    }
    return res.json()
  })

export function useReport(weekStart?: string) {
  const url = weekStart
    ? `/api/report?week_start=${weekStart}`
    : '/api/report'

  return useSWR<ReportData>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute
  })
}

export function useVendor(vendorId: string | null, weekStart?: string) {
  const url = vendorId
    ? weekStart
      ? `/api/vendors/${vendorId}?week_start=${weekStart}`
      : `/api/vendors/${vendorId}`
    : null

  return useSWR<VendorData>(url, fetcher, {
    revalidateOnFocus: false,
  })
}

export function useWeeks(year: number, month: number) {
  return useSWR<WeeksResponse>(
    `/api/weeks?year=${year}&month=${month}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 86400000, // 24 hours - weeks don't change
    }
  )
}
