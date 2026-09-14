import { useMemo } from 'react'
import { useGetCustomerSegmentsQuery } from '@services/apiCustomerSegment'

export type CustomerSegmentNames = Readonly<Record<string, string>>

export const getCustomerSegmentName = (
  code: string,
  names: CustomerSegmentNames
): string => names[code] ?? code

export const useCustomerSegmentNames = (): CustomerSegmentNames => {
  const { data: customerSegments } = useGetCustomerSegmentsQuery()

  return useMemo(
    () =>
      Object.fromEntries(
        (customerSegments ?? []).map(({ code, name }) => [code, name])
      ),
    [customerSegments]
  )
}
