import { CloudField } from './CloudField'
import type { SolarScene } from './solar-scene'

/** Toạ độ sao đêm: [left, top, đường kính]. */
const NIGHT_STARS = [
  ['12%', '19%', '2px'],
  ['27%', '31%', '3px'],
  ['46%', '14%', '2px'],
  ['64%', '26%', '2px'],
  ['82%', '17%', '3px'],
  ['91%', '39%', '2px']
] as const

const MOUNTAIN_PATHS = [
  'M0 410 C95 370 145 288 235 306 C305 319 332 389 411 370 C498 349 532 230 626 243 C724 258 733 357 815 342 C893 328 930 263 1000 274 L1000 700 L0 700 Z',
  'M0 485 C91 454 137 367 211 375 C284 382 301 449 372 438 C450 426 486 323 564 330 C652 338 675 443 758 427 C847 410 903 334 1000 363 L1000 700 L0 700 Z',
  'M0 560 C112 518 178 504 270 521 C351 536 408 586 502 552 C598 518 661 497 747 530 C835 564 899 526 1000 501 L1000 700 L0 700 Z'
] as const

export interface SolarLandscapeProps {
  scene: SolarScene
}

/** Nền panel thương hiệu: mặt trời, sao, mây trôi và ba lớp núi. */
export function SolarLandscape({ scene }: SolarLandscapeProps) {
  const mountainFills = [
    scene.farMountain,
    scene.middleMountain,
    scene.nearMountain
  ]

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        className="absolute size-[clamp(64px,8vw,108px)] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[top,left,opacity,background-color,box-shadow] duration-1000"
        style={{
          left: scene.sunLeft,
          top: scene.sunTop,
          opacity: scene.sunOpacity,
          backgroundColor: scene.sunColor,
          boxShadow: `0 0 55px 16px ${scene.sunColor}55`
        }}
      />

      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          scene.isNight ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {NIGHT_STARS.map(([left, top, size]) => (
          <span
            key={`${left}-${top}`}
            className="absolute rounded-full bg-white/70"
            style={{ left, top, width: size, height: size }}
          />
        ))}
      </div>

      <CloudField palette={scene.cloud} />

      <svg
        viewBox="0 0 1000 700"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[78%] w-full"
      >
        {MOUNTAIN_PATHS.map((path, index) => (
          <path
            key={path.slice(0, 12)}
            className="auth-mountain-layer transition-[fill] duration-1000"
            d={path}
            fill={mountainFills[index]}
          />
        ))}
      </svg>
    </div>
  )
}
