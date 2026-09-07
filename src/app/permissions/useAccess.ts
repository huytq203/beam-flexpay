import { useCallback, useMemo } from 'react'
import { useAppSelector } from '@hooks/hook'
import { grants, grantsScreenAccess, grantsScreenAction } from './access'
import type { PermissionCode } from './permission-codes'
import { SCREENS, type ScreenActionId, type ScreenId } from './registry'

export interface AccessApi {
  has: (code: PermissionCode) => boolean
  hasAny: (codes: readonly PermissionCode[]) => boolean
  hasAll: (codes: readonly PermissionCode[]) => boolean
}

export const useAccess = (): AccessApi => {
  const permissions = useAppSelector(
    (state) => state.auth.profile.permissions
  )

  const has = useCallback(
    (code: PermissionCode) => grants(permissions, code),
    [permissions]
  )

  return useMemo(
    () => ({
      has,
      hasAny: (codes: readonly PermissionCode[]) => codes.some(has),
      hasAll: (codes: readonly PermissionCode[]) => codes.every(has)
    }),
    [has]
  )
}

export interface ScreenAccessApi<S extends ScreenId> {
  canView: boolean
  can: (action: ScreenActionId<S>) => boolean
}

export const useScreenAccess = <S extends ScreenId>(
  screen: S
): ScreenAccessApi<S> => {
  const permissions = useAppSelector(
    (state) => state.auth.profile.permissions
  )
  const config = SCREENS[screen]

  const can = useCallback(
    (action: ScreenActionId<S>): boolean =>
      grantsScreenAction(permissions, config, action as string),
    [config, permissions]
  )

  return useMemo(
    () => ({
      canView: grantsScreenAccess(permissions, config),
      can
    }),
    [can, config, permissions]
  )
}
