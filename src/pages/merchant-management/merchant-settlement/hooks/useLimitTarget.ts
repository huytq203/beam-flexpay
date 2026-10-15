import { useSearchParams } from 'react-router-dom'
import type { LimitLevel } from '../types/withdrawalLimit.types'

const LEVELS: readonly LimitLevel[] = ['SYSTEM', 'MASTER', 'SUB']
const isLevel = (value: string | null): value is LimitLevel =>
  LEVELS.some((level) => level === value)

/** Đối tượng đang xem lưu trên URL (rule 04): `?level=SUB&targetId=...`. */
export const useLimitTarget = () => {
  const [params, setParams] = useSearchParams()
  const raw = params.get('level')
  const level = isLevel(raw) ? raw : undefined
  const targetId = params.get('targetId') ?? undefined

  const setTarget = (nextLevel?: LimitLevel, nextTargetId?: string): void =>
    setParams(
      nextLevel
        ? {
            level: nextLevel,
            ...(nextTargetId ? { targetId: nextTargetId } : {})
          }
        : {}
    )

  return { level, targetId, setTarget }
}
