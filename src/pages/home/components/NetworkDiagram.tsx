import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { boundsOf, type NetworkGeometry } from './network-geometry'
import type { TransitLine } from '../types/transit'
import { stationLabelText } from '../hooks/useTransitMap'

interface NetworkDiagramProps {
  lines: readonly TransitLine[]
  geometry: NetworkGeometry
  activeLineId: string | null
  /**
   * Ở khổ hẹp, nhãn ga thu xuống dưới ngưỡng đọc được và chồng lên nhau, nên
   * bản đồ chỉ giữ hình tuyến — tên đầy đủ nằm ngay dưới, trong chú giải.
   */
  showLabels?: boolean
}

/**
 * Bản đồ phẳng, dựng từ đúng hình học của mô hình 3D. Đây là bản dựng khi
 * WebGL không khả dụng hoặc người dùng bật `prefers-reduced-motion` ở mức tắt
 * hẳn cảnh động — cùng một mạng lưới, cùng nhãn ga, không mất thông tin nào.
 */
export function NetworkDiagram({
  lines,
  geometry,
  activeLineId,
  showLabels = true
}: NetworkDiagramProps) {
  const bounds = boundsOf(geometry, 3.2)

  return (
    <svg
      /*
       * Bản dự phòng khi WebGL không dựng được: nó phải giữ nguyên mọi ga như
       * link thật, đúng cam kết trong direction contract. Bản rút gọn ở khổ hẹp
       * (`showLabels === false`) thì không — đĩa ga ở đó chỉ ~6px, nhỏ hơn ngưỡng
       * chạm an toàn, nên nó lùi về vai trò trang trí và chú giải bên dưới là
       * đường đi duy nhất.
       */
      aria-hidden={showLabels ? undefined : true}
      role={showLabels ? 'group' : undefined}
      aria-label={showLabels ? 'Bản đồ mạng lưới FlexPay' : undefined}
      className='size-full'
      viewBox={`${bounds.minX} ${bounds.minZ} ${bounds.width} ${bounds.height}`}
      preserveAspectRatio='xMidYMid meet'
    >
      {lines.map((line, index) => {
        const shape = geometry.lines[index]
        const muted = activeLineId !== null && activeLineId !== line.id

        return (
          <g
            key={line.id}
            style={
              {
                '--line': muted
                  ? 'var(--portal-dim)'
                  : `var(--line-${line.token})`
              } as CSSProperties
            }
            className='[&_*]:transition-colors [&_*]:duration-300'
          >
            <polyline
              points={shape.polyline.map((point) => `${point.x},${point.z}`).join(' ')}
              fill='none'
              stroke='var(--line)'
              strokeWidth={0.34}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            {shape.stations.map((point, stationIndex) => {
              const station = line.stations[stationIndex]
              const marker = (
                <>
                  <circle
                    cx={point.x}
                    cy={point.z}
                    r={0.3}
                    fill='var(--portal-plate)'
                    stroke='var(--line)'
                    strokeWidth={0.14}
                  />
                  {showLabels && (
                    <text
                      x={point.x + 0.52}
                      y={point.z + 0.12}
                      fill='var(--portal-ink)'
                      fontSize={0.34}
                      letterSpacing={0.02}
                      className='font-signage font-semibold uppercase'
                    >
                      {stationLabelText(station?.label)}
                    </text>
                  )}
                </>
              )

              if (!showLabels || !station) {
                return <g key={station?.id ?? stationIndex}>{marker}</g>
              }

              return (
                <Link
                  key={station.id}
                  to={station.to}
                  aria-label={stationLabelText(station.label)}
                  className='outline-none [&:focus-visible_circle]:stroke-[var(--primary)] [&:hover_circle]:fill-[var(--line)]'
                >
                  {marker}
                </Link>
              )
            })}
          </g>
        )
      })}

      <circle
        cx={geometry.hub.x}
        cy={geometry.hub.z}
        r={0.62}
        fill='var(--portal-plate)'
        stroke='var(--primary)'
        strokeWidth={0.22}
      />
    </svg>
  )
}
