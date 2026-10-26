import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useLatest } from 'ahooks'
import { useTranslation } from 'react-i18next'
import PopoverComponent from '@components/ui/popover-component'
import { CapyMenu } from './CapyMenu'
import { useAppSelector } from '@hooks/hook'
import { BODY_HEIGHT, BODY_WIDTH, CapyEngine } from './engine/CapyEngine'
import { buildGreeting, displayName } from './engine/greeting'
import { buildTuning, type Levels } from './engine/tuning'
import { useCapyFrames, type CapyImages } from './hooks/useCapyFrames'
import { useCapySettings } from './hooks/useCapySettings'

const CANVAS_SIZE = 170
const LEAVE_MS = 1700

interface OverlayProps {
  readonly images: CapyImages
  readonly idleOnly: boolean
  readonly levels: Levels
  /** Đang tắt: vẫy chào tạm biệt rồi mờ dần. */
  readonly leaving: boolean
}

function CapyOverlay({ images, idleOnly, levels, leaving }: OverlayProps) {
  const { t } = useTranslation()
  const { fullName, email } = useAppSelector((state) => state.auth.profile)
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<CapyEngine | null>(null)
  const [bubble, setBubble] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { setEnabled } = useCapySettings()

  const greetingRef = useLatest(() =>
    buildGreeting(
      t,
      displayName(fullName, email),
      new Date().getHours(),
      Math.random
    )
  )

  useEffect(() => {
    const box = boxRef.current
    const ctx = canvasRef.current?.getContext('2d')
    if (!box || !ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const canvas = canvasRef.current
    if (canvas) canvas.width = canvas.height = CANVAS_SIZE * dpr
    const engine = new CapyEngine({
      ctx,
      images,
      box,
      canvasSize: CANVAS_SIZE,
      dpr,
      greeting: () => greetingRef.current(),
      onBubble: setBubble
    })
    engineRef.current = engine
    engine.start()
    return () => {
      engine.stop()
      engineRef.current = null
    }
  }, [images, greetingRef])

  useEffect(() => {
    engineRef.current?.setIdleOnly(idleOnly)
  }, [idleOnly])

  const { speed, activity, sleepAfter } = levels
  useEffect(() => {
    engineRef.current?.setTuning(buildTuning({ speed, activity, sleepAfter }))
  }, [images, speed, activity, sleepAfter])

  useEffect(() => {
    if (leaving) engineRef.current?.perform('bye')
  }, [leaving])

  useEffect(() => {
    if (!menuOpen) return
    const close = (event: Event) => {
      const target = event.target
      if (
        target instanceof Element &&
        target.closest('#capy-menu, [data-capy-box]')
      )
        return
      setMenuOpen(false)
    }
    document.addEventListener('pointerdown', close)
    const timer = window.setTimeout(() => setMenuOpen(false), 6000)
    return () => {
      document.removeEventListener('pointerdown', close)
      window.clearTimeout(timer)
    }
  }, [menuOpen])

  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    engineRef.current?.pointerDown(event.clientX, event.clientY)
  }
  const onMove = (event: PointerEvent<HTMLDivElement>) =>
    engineRef.current?.pointerMove(event.clientX, event.clientY)
  const onUp = () => {
    if (engineRef.current?.pointerUp() === 'click') setMenuOpen((open) => !open)
  }
  const onEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') engineRef.current?.greet()
  }

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[900] ${leaving ? 'opacity-0 transition-opacity delay-1000 duration-500' : ''}`}
      aria-hidden='true'
      data-testid='capy-overlay'
    >
      <PopoverComponent
        open={menuOpen}
        trigger={[]}
        placement='top'
        content={
          <CapyMenu
            onGreet={() => {
              setMenuOpen(false)
              engineRef.current?.perform('greet')
            }}
            onSleep={() => {
              setMenuOpen(false)
              engineRef.current?.perform('sleep')
            }}
            onHide={() => setEnabled(false)}
          />
        }
      >
        <div
          ref={boxRef}
          data-capy-box=''
          className='pointer-events-auto absolute top-0 left-0 cursor-grab touch-none select-none will-change-transform'
          style={{ width: BODY_WIDTH, height: BODY_HEIGHT }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerEnter={onEnter}
        >
          <div
            className={`pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-foreground transition-opacity ${bubble ? 'opacity-100' : 'opacity-0'}`}
          >
            {bubble}
          </div>
          <i className='pointer-events-none absolute -bottom-0.5 left-1/2 h-1.5 w-11 -translate-x-1/2 rounded-full bg-black/15' />
          <canvas
            ref={canvasRef}
            data-testid='capy-canvas'
            className='pointer-events-none absolute left-1/2 bottom-[-10px] -ml-[85px] h-[170px] w-[170px]'
          />
        </div>
      </PopoverComponent>
    </div>
  )
}

export function Capy() {
  const { available, enabled, idleOnly, speed, activity, sleepAfter } =
    useCapySettings()
  const active = available && enabled
  const images = useCapyFrames(active)
  const [prevActive, setPrevActive] = useState(active)
  const [leaving, setLeaving] = useState(false)

  // Chuyển từ bật sang tắt: giữ lớp phủ thêm một lúc để Capy vẫy chào rồi mờ dần, không dựng lại engine.
  if (prevActive !== active) {
    setPrevActive(active)
    setLeaving(prevActive && !active && available)
  }

  useEffect(() => {
    if (!leaving) return
    const timer = window.setTimeout(() => setLeaving(false), LEAVE_MS)
    return () => window.clearTimeout(timer)
  }, [leaving])

  if ((!active && !leaving) || !images) return null
  return (
    <CapyOverlay
      images={images}
      idleOnly={idleOnly}
      levels={{ speed, activity, sleepAfter }}
      leaving={!active}
    />
  )
}
