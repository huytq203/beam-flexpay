import { useCallback, useMemo } from 'react'
import { useAppSelector } from '@hooks/hook'
import { buildPermissionCode, grants } from './access'
import type { Action, PermissionCode } from './modules'
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
  const { has } = useAccess()
  const config = SCREENS[screen]

  const can = useCallback(
    (action: ScreenActionId<S>): boolean => {
      const actions = config.actions as Readonly<Record<string, Action>>
      const requiredAction = actions[action as string]

      return requiredAction === undefined
        ? false
        : has(buildPermissionCode(config.module, requiredAction))
    },
    [config, has]
  )

  return useMemo(
    () => ({
      canView: has(buildPermissionCode(config.module, config.view)),
      can
    }),
    [can, config, has]
  )
}
