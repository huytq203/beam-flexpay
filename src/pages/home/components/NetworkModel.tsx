import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { NetworkGeometry } from './network-geometry'
import type { NetworkScene, SceneLine } from './network-scene'
import type { TransitLine } from '../types/transit'
import { stationLabelText } from '../hooks/useTransitMap'

interface NetworkModelProps {
  lines: readonly TransitLine[]
  geometry: NetworkGeometry
  activeLineId: string | null
  onLineFocus: (lineId: string | null) => void
  /** Gọi khi WebGL không dựng được, để màn hình rơi về bản đồ SVG. */
  onUnavailable: () => void
}

const readToken = (styles: CSSStyleDeclaration, name: string, fallback: string): string =>
  styles.getPropertyValue(name).trim() || fallback

export function NetworkModel({
  lines,
  geometry,
  activeLineId,
  onLineFocus,
  onUnavailable
}: NetworkModelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<NetworkScene | null>(null)
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)

  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const labelLayer = labelRef.current
    if (!container || !canvas || !labelLayer || lines.length === 0) return

    let cancelled = false
    const styles = getComputedStyle(document.documentElement)
    const sceneLines: SceneLine[] = lines.map((line, index) => ({
      id: line.id,
      color: readToken(styles, `--line-${line.token}`, '#1f63d6'),
      geometry: geometry.lines[index],
      stations: line.stations.map((station) => ({
        id: station.id,
        label: stationLabelText(station.label),
        to: station.to
      }))
    }))

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    import('./network-scene')
      .then(({ createNetworkScene }) => {
        if (cancelled) return

        const scene = createNetworkScene({
          canvas,
          container,
          labelLayer,
          lines: sceneLines,
          network: geometry,
          hubLabel: 'Bạn ở đây',
          hubColor: readToken(styles, '--primary', '#2bd9d0'),
          plateColor: readToken(styles, '--portal-plate', '#ffffff'),
          dimColor: readToken(styles, '--portal-dim', '#a9b1bc'),
          reduceMotion,
          onStationActivate: (to) => navigateRef.current(to),
          onLineFocus
        })

        if (!scene) {
          onUnavailable()
          return
        }
        sceneRef.current = scene
      })
      .catch(onUnavailable)

    return () => {
      cancelled = true
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [lines, geometry, onLineFocus, onUnavailable])

  useEffect(() => {
    sceneRef.current?.setActiveLine(activeLineId)
  }, [activeLineId])

  return (
    <div
      ref={containerRef}
      className='relative size-full'
      aria-hidden
    >
      <div className='network-table pointer-events-none absolute inset-0' />
      <canvas
        ref={canvasRef}
        className='absolute inset-0 size-full'
      />
      <div
        ref={labelRef}
        className='pointer-events-none absolute inset-0 overflow-hidden'
      />
    </div>
  )
}
