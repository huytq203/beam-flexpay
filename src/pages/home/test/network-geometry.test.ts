import { describe, expect, it } from 'vitest'
import {
  boundsOf,
  buildNetworkGeometry
} from '../components/network-geometry'

const distanceFromHub = (point: { x: number; z: number }): number =>
  Math.hypot(point.x, point.z)

describe('buildNetworkGeometry', () => {
  it('dựng đúng một tuyến cho mỗi phân hệ, giữ nguyên số ga', () => {
    const geometry = buildNetworkGeometry([
      { id: 'a', stationCount: 4 },
      { id: 'b', stationCount: 2 },
      { id: 'c', stationCount: 3 }
    ])

    expect(geometry.lines.map((line) => line.id)).toEqual(['a', 'b', 'c'])
    expect(geometry.lines.map((line) => line.stations.length)).toEqual([4, 2, 3])
  })

  it('bắt đầu tuyến ở ngoài mép ga trung chuyển, không phải ở tâm', () => {
    const geometry = buildNetworkGeometry([
      { id: 'a', stationCount: 3 },
      { id: 'b', stationCount: 2 }
    ])

    geometry.lines.forEach((line) => {
      expect(distanceFromHub(line.polyline[0])).toBeGreaterThan(0.5)
    })
  })

  it('xếp mỗi tuyến ở một cao độ riêng để chỗ giao cắt đọc được', () => {
    const geometry = buildNetworkGeometry([
      { id: 'a', stationCount: 2 },
      { id: 'b', stationCount: 2 },
      { id: 'c', stationCount: 2 }
    ])
    const elevations = geometry.lines.map((line) => line.elevation)

    expect(new Set(elevations).size).toBe(elevations.length)
  })

  it('vẫn dựng được tuyến khi phân hệ chỉ có một ga', () => {
    const geometry = buildNetworkGeometry([{ id: 'a', stationCount: 1 }])

    expect(geometry.lines[0].stations).toHaveLength(1)
    expect(geometry.lines[0].polyline).toHaveLength(2)
  })

  it('khung bao phủ hết mọi ga và có đệm hai bên', () => {
    const geometry = buildNetworkGeometry([
      { id: 'a', stationCount: 4 },
      { id: 'b', stationCount: 3 }
    ])
    const box = boundsOf(geometry, 2)

    geometry.lines.forEach((line) => {
      line.stations.forEach((station) => {
        expect(station.x).toBeGreaterThan(box.minX)
        expect(station.x).toBeLessThan(box.minX + box.width)
        expect(station.z).toBeGreaterThan(box.minZ)
        expect(station.z).toBeLessThan(box.minZ + box.height)
      })
    })
  })
})
