import type { ReactElement, ReactNode } from 'react'
import type { ScreenActionId, ScreenId } from './registry'
import { useScreenAccess } from './useAccess'

interface CanProps<S extends ScreenId> {
  screen: S
  action: ScreenActionId<S>
  children: ReactNode
}

/** Thiếu quyền thì ẩn hoàn toàn hành động theo quyết định của đặc tả. */
export const Can = <S extends ScreenId>({
  screen,
  action,
  children
}: CanProps<S>): ReactElement | null => {
  const { can } = useScreenAccess(screen)
  return can(action) ? <>{children}</> : null
}
