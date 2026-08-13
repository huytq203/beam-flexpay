import { describe, expect, it } from 'vitest'
import { navigationItems } from '@components/layout/components/Navigation'
import { ACTION, MODULE } from '../modules'
import {
  DEFAULT_SCREEN_ACTIONS,
  findScreenByPath,
  SCREENS,
  type ScreenId
} from '../registry'

const screens = Object.values(SCREENS)

describe('SCREENS', () => {
  it('không có hai màn trùng path', () => {
    const paths = screens.map((screen) => screen.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('mọi path và alias đều nằm dưới secure-panel', () => {
    for (const screen of screens) {
      expect(screen.path.startsWith('/secure-panel/')).toBe(true)
      if (!('aliasPaths' in screen)) continue

      for (const alias of screen.aliasPaths) {
        expect(alias.startsWith('/secure-panel/')).toBe(true)
      }
    }
  })

  it('khai đúng các màn identity đặc biệt', () => {
    expect(SCREENS.USER_ACCOUNT.module).toBe(MODULE.USER)
    expect(SCREENS.USER_ACCOUNT.actions.assignRoles).toBe(ACTION.UPDATE)
    expect(SCREENS.CONFIRM_EKYC.module).toBe(MODULE.ADMIN)
    expect(SCREENS.CONFIRM_EKYC.actions.approve).toBe(ACTION.FULL)
  })

  it('mọi screen đều có đủ 6 action chuẩn', () => {
    for (const screen of screens) {
      expect(screen.actions).toMatchObject(DEFAULT_SCREEN_ACTIONS)
    }
  })
})

describe('findScreenByPath', () => {
  it('khớp chính xác và route con', () => {
    expect(findScreenByPath(SCREENS.USER_ACCOUNT.path)).toBe(
      SCREENS.USER_ACCOUNT
    )
    expect(findScreenByPath(`${SCREENS.FEE_POLICY.path}/edit/abc-123`)).toBe(
      SCREENS.FEE_POLICY
    )
  })

  it('không khớp nửa chừng một đoạn path', () => {
    expect(
      findScreenByPath(`${SCREENS.USER_ACCOUNT.path}-khac`)
    ).toBeUndefined()
  })

  it('alias trỏ về đúng màn', () => {
    expect(
      findScreenByPath(
        '/secure-panel/wallet-administration/transaction-wallet'
      )
    ).toBe(SCREENS.TRANSACTION_WALLET)
  })

  it('path ngoài registry trả về undefined', () => {
    expect(findScreenByPath('/secure-panel/forbidden')).toBeUndefined()
    expect(findScreenByPath('/')).toBeUndefined()
  })
})

describe('sidebar khớp registry', () => {
  it('mọi menu con trỏ tới ScreenId có thật và đúng path', () => {
    for (const group of navigationItems) {
      for (const child of group.children ?? []) {
        const screenId: ScreenId | undefined = child.screen
        expect(screenId).toBeDefined()
        if (!screenId) continue

        expect(`/${String(group.key)}/${String(child.key)}`).toBe(
          SCREENS[screenId].path
        )
      }
    }
  })
})
