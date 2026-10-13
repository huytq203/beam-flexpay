import { describe, expect, it } from 'vitest'
import {
  grants,
  grantsAny,
  grantsScreenAccess,
  grantsScreenAction
} from '../access'
import { PERMISSION, SUPER_ADMIN_PERMISSION } from '../permission-codes'
import { SCREENS } from '../registry'

describe('grants', () => {
  it('super-admin đi qua mọi quyền', () => {
    expect(grants([SUPER_ADMIN_PERMISSION], PERMISSION.ROLE_DELETE)).toBe(true)
    expect(grants([SUPER_ADMIN_PERMISSION], PERMISSION.USER_CREATE)).toBe(true)
  })

  it('chỉ chấp nhận quyền khớp chính xác từng ký tự', () => {
    expect(grants(['EWALLET:USER:CREATE'], PERMISSION.USER_CREATE)).toBe(true)
    expect(grants(['EWALLET:USER:VIEW'], PERMISSION.USER_CREATE)).toBe(false)
    expect(grants(['EWALLET:USER:VIEW_ALL'], PERMISSION.USER_VIEW)).toBe(false)
  })

  it('mã khác tiền tố là quyền khác, không được suy diễn', () => {
    expect(
      grants(['PERMISSION_EWALLET:FEE:APPROVE'], PERMISSION.FEE_UPDATE)
    ).toBe(false)
    expect(grants(['FEE:UPDATE'], PERMISSION.FEE_UPDATE)).toBe(false)
    expect(grants(['EWALLET:FEE:UPDATE'], PERMISSION.FEE_UPDATE)).toBe(true)
  })

  it('MODULE:FULL không còn tự bao trùm action rời của module', () => {
    expect(grants(['EWALLET:ROLE:FULL'], PERMISSION.ROLE_DELETE)).toBe(false)
    expect(grants(['EWALLET:ROLE:FULL'], PERMISSION.ROLE_FULL)).toBe(true)
  })

  it('mảng rỗng chặn mọi thứ', () => {
    expect(grants([], PERMISSION.USER_VIEW)).toBe(false)
    expect(grants([], PERMISSION.ADMIN_FULL)).toBe(false)
  })
})

describe('grantsAny', () => {
  it('đúng khi có bất kỳ mã nào trong danh sách', () => {
    expect(
      grantsAny(
        ['EWALLET:FREEZE:APPROVE'],
        [PERMISSION.FREEZE_APPROVE, PERMISSION.ADMIN_FULL]
      )
    ).toBe(true)
    expect(
      grantsAny(['EWALLET:FREEZE:UPDATE'], [PERMISSION.FREEZE_APPROVE])
    ).toBe(false)
  })
})

describe('grantsScreenAction', () => {
  it('mã của chính hành động thì mở hành động đó', () => {
    expect(
      grantsScreenAction(
        ['EWALLET:FEE:UPDATE'],
        SCREENS.FEE_CONFIG,
        'deactivate'
      )
    ).toBe(true)
    expect(
      grantsScreenAction(['EWALLET:FEE:VIEW'], SCREENS.FEE_CONFIG, 'deactivate')
    ).toBe(false)
  })

  it('duyệt và kích hoạt chính sách phí cần FEE:APPROVE, FEE:UPDATE không đủ', () => {
    expect(
      grantsScreenAction(['EWALLET:FEE:UPDATE'], SCREENS.FEE_CONFIG, 'approve')
    ).toBe(false)
    expect(
      grantsScreenAction(
        ['EWALLET:FEE:APPROVE'],
        SCREENS.FEE_CONFIG,
        'activate'
      )
    ).toBe(true)
  })

  it('mã full mà màn khai sẵn thì mở mọi hành động của màn', () => {
    expect(
      grantsScreenAction(['EWALLET:USER:FULL'], SCREENS.USER_ACCOUNT, 'delete')
    ).toBe(true)
  })

  it('extraFull của màn mở mọi hành động', () => {
    expect(
      grantsScreenAction(
        ['EWALLET:EWALLET:FULL'],
        SCREENS.TRANSACTION_WALLET,
        'viewDetail'
      )
    ).toBe(true)
  })

  it('hành động không khai trong registry luôn bị chặn', () => {
    expect(
      grantsScreenAction(
        [SUPER_ADMIN_PERMISSION],
        SCREENS.FEE_POLICY,
        'khong-ton-tai'
      )
    ).toBe(false)
  })
})

describe('grantsScreenAccess', () => {
  it('màn giao dịch mở với quyền xem, TRANSACTION:FULL hoặc EWALLET:FULL, đúng như BE', () => {
    for (const code of [
      'EWALLET:TRANSACTION:VIEW',
      'EWALLET:TRANSACTION:FULL',
      'EWALLET:EWALLET:FULL'
    ]) {
      expect(grantsScreenAccess([code], SCREENS.TRANSACTION_WALLET)).toBe(true)
    }
    expect(
      grantsScreenAccess(['EWALLET:FEE:VIEW'], SCREENS.TRANSACTION_WALLET)
    ).toBe(false)
  })

  it('màn không đặt accessPermission chấp nhận bất kỳ mã nào của màn', () => {
    expect(grantsScreenAccess(['EWALLET:FEE:CREATE'], SCREENS.FEE_POLICY)).toBe(
      true
    )
    expect(
      grantsScreenAccess(['EWALLET:WALLET:FULL'], SCREENS.FEE_POLICY)
    ).toBe(false)
  })
})
