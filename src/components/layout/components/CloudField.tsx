import type { CSSProperties, ReactElement } from 'react'
import { usePageHidden } from '../hooks/usePageHidden'
import {
  CLOUD_LAYERS,
  CLOUD_SHAPES,
  type CloudLayer,
  type CloudShape,
  type CloudShapeName
} from './cloud-shapes'
import './cloud-field.css'

/** Lớp sáng nhấc lên bấy nhiêu đơn vị viewBox, để lộ viền bóng ở đáy mây. */
const LIGHT_LIFT = 7

export interface CloudPalette {
  /** Mặt mây hứng sáng. */
  light: string
  /** Đáy mây trong bóng. */
  shade: string
}

interface CloudSilhouetteProps {
  shape: CloudShape
  fill: string
}

function CloudSilhouette({
  shape,
  fill
}: CloudSilhouetteProps): ReactElement {
  if (shape.kind === 'wisp') {
    return (
      <g className="auth-cloud-fill" fill={fill}>
        {shape.streaks.map((streak) => (
          <ellipse key={`${streak.cx}-${streak.cy}`} {...streak} />
        ))}
      </g>
    )
  }

  return (
    <g className="auth-cloud-fill" fill={fill}>
      <rect {...shape.base} />
      {shape.puffs.map((puff) => (
        <circle key={`${puff.cx}-${puff.cy}`} {...puff} />
      ))}
    </g>
  )
}

interface CloudProps {
  shapeName: CloudShapeName
  palette: CloudPalette
}

function Cloud({ shapeName, palette }: CloudProps): ReactElement {
  const shape = CLOUD_SHAPES[shapeName]

  if (shape.kind === 'wisp') {
    return (
      <svg viewBox={`0 0 ${shape.width} ${shape.height}`} focusable="false">
        <CloudSilhouette shape={shape} fill={palette.light} />
      </svg>
    )
  }

  return (
    <svg viewBox={`0 0 ${shape.width} ${shape.height}`} focusable="false">
      <CloudSilhouette shape={shape} fill={palette.shade} />
      <g transform={`translate(0 ${-LIGHT_LIFT})`}>
        <CloudSilhouette shape={shape} fill={palette.light} />
      </g>
    </svg>
  )
}

interface CloudTrackProps {
  layer: CloudLayer
  palette: CloudPalette
  opacityScale: number
}

function CloudTrack({
  layer,
  palette,
  opacityScale
}: CloudTrackProps): ReactElement {
  const instances = [
    ...layer.clouds,
    ...layer.clouds.map((cloud) => ({ ...cloud, left: cloud.left + 50 }))
  ]

  return (
    <div
      className="auth-cloud-track"
      style={{ animationDuration: `${layer.durationSeconds}s` }}
    >
      {instances.map((cloud, index) => {
        // Bản gốc và bản nhân đôi phải trùng pha nhấp nhô, nếu lệch thì
        // khoảnh khắc track lặp lại sẽ thấy mây nhảy dọc.
        const phase = index % layer.clouds.length
        const style: CSSProperties = {
          left: `${cloud.left}%`,
          top: cloud.top,
          width: cloud.width,
          opacity: layer.opacity * opacityScale
        }
        if (layer.blurPx > 0) style.filter = `blur(${layer.blurPx}px)`
        if (layer.hasFloat) {
          style.animationDuration = `${16 + phase * 3}s`
          style.animationDelay = `${-phase * 2.6}s`
        }

        return (
          <div
            key={`${layer.id}-${index}`}
            className={layer.hasFloat ? 'auth-cloud auth-cloud--float' : 'auth-cloud'}
            style={style}
          >
            <Cloud shapeName={cloud.shape} palette={palette} />
          </div>
        )
      })}
    </div>
  )
}

export interface CloudFieldProps {
  palette: CloudPalette
  /** Hệ số nhân opacity theo độ phủ mây thực tế. Mặc định 1 = giữ nguyên. */
  opacityScale?: number
}

/** Dải mây trôi từ phải qua trái, nằm sau dãy núi của cảnh mặt trời. */
export function CloudField({
  palette,
  opacityScale = 1
}: CloudFieldProps): ReactElement {
  const isPageHidden = usePageHidden()

  return (
    <div
      className="auth-cloudfield pointer-events-none absolute inset-0 overflow-hidden"
      data-paused={isPageHidden}
      aria-hidden="true"
    >
      {CLOUD_LAYERS.map((layer) => (
        <CloudTrack
          key={layer.id}
          layer={layer}
          palette={palette}
          opacityScale={opacityScale}
        />
      ))}
    </div>
  )
}
