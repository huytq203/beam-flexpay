import { ENV } from '@configs/env'
import { z } from 'zod'

const reverseGeocodeResponseSchema = z.object({
  locality: z.string().optional().default(''),
  city: z.string().optional().default(''),
  principalSubdivision: z.string().optional().default('')
})

const isDistinctLocation = (locations: string[], candidate: string): boolean =>
  !locations.some(
    (location) =>
      location.localeCompare(candidate, 'vi', { sensitivity: 'base' }) === 0
  )

const readLocationLabel = (response: unknown): string | null => {
  const parsed = reverseGeocodeResponseSchema.safeParse(response)
  if (!parsed.success) return null

  const locations = [
    parsed.data.locality,
    parsed.data.city,
    parsed.data.principalSubdivision
  ].reduce<string[]>((result, value) => {
    const candidate = value.trim()
    if (candidate && isDistinctLocation(result, candidate)) {
      result.push(candidate)
    }
    return result
  }, [])

  return locations.slice(0, 2).join(', ') || null
}

export interface ReverseGeocodeCoordinates {
  latitude: number
  longitude: number
}

/** Đổi GPS vừa được người dùng cấp quyền thành địa danh, không gửi qua BE CMS. */
export async function reverseGeocodeCurrentLocation({
  latitude,
  longitude
}: ReverseGeocodeCoordinates): Promise<string | null> {
  const url = new URL('/data/reverse-geocode-client', ENV.REVERSE_GEOCODING)
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('localityLanguage', 'vi')

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5_000) })
    if (!response.ok) return null
    const body: unknown = await response.json()
    return readLocationLabel(body)
  } catch {
    return null
  }
}
