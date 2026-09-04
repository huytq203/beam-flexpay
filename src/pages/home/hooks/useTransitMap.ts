import { useMemo } from 'react'
import useNavigationEw from '@hooks/useNavigation'
import type { ItemTypeCustom } from '@components/layout/components/Navigation'
import type { ReactNode } from 'react'
import type { TransitLine, TransitStation } from '../types/transit'
import { FALLBACK_LINE, LINE_REGISTRY } from '../constants/lines'
import {
  buildNetworkGeometry,
  type NetworkGeometry
} from '../components/network-geometry'

export interface TransitMap {
  lines: TransitLine[]
  geometry: NetworkGeometry
  stationCount: number
}

/**
 * Nhãn ga trong `navigationItems` là ReactNode vì một số mục đi qua i18n.
 * Mô hình 3D và bản đồ SVG cần chuỗi thuần, nên quy đổi tại một chỗ duy nhất.
 */
export const stationLabelText = (label: ReactNode): string =>
  typeof label === 'string' || typeof label === 'number' ? String(label) : ''

const sectionKeyOf = (item: ItemTypeCustom): string =>
  item.groupLabel
    ? `group:${String(item.groupLabel)}`
    : `item:${String(item.key)}`

const stationPathOf = (parentKey: ItemTypeCustom['key'], child: ItemTypeCustom): string =>
  child.link ?? `/${String(parentKey)}/${String(child.key)}`

const stationsOf = (item: ItemTypeCustom): TransitStation[] =>
  (item.children ?? []).map((child) => ({
    id: `${String(item.key)}:${String(child.key)}`,
    key: child.key,
    label: child.label,
    icon: child.icon,
    to: stationPathOf(item.key, child)
  }))

/**
 * Gộp `navigationItems` đã lọc theo quyền thành các tuyến. Hai mục cùng
 * `groupLabel` (ví dụ merchant và ví doanh nghiệp) là một tuyến với các ga nối
 * tiếp nhau, đúng cách sidebar đang gom nhóm.
 */
const buildLines = (navigation: readonly ItemTypeCustom[]): TransitLine[] =>
  navigation.reduce<TransitLine[]>((lines, item) => {
    const id = sectionKeyOf(item)
    const stations = stationsOf(item)
    if (stations.length === 0) return lines

    const existing = lines.find((line) => line.id === id)
    if (existing) {
      existing.stations.push(...stations)
      return lines
    }

    const identity = LINE_REGISTRY[id] ?? FALLBACK_LINE
    lines.push({
      id,
      token: identity.token,
      code: identity.code,
      label: item.groupLabel ?? item.label,
      description: identity.description,
      elevatedRisk: Boolean(identity.elevatedRisk),
      stations
    })
    return lines
  }, [])

export const useTransitMap = (): TransitMap => {
  const [navigation] = useNavigationEw()

  return useMemo(() => {
    const lines = buildLines(navigation)
    return {
      lines,
      geometry: buildNetworkGeometry(
        lines.map((line) => ({
          id: line.id,
          stationCount: line.stations.length
        }))
      ),
      stationCount: lines.reduce(
        (total, line) => total + line.stations.length,
        0
      )
    }
  }, [navigation])
}
