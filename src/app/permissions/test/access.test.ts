import { describe, expect, it } from 'vitest'
import { buildPermissionCode, grants } from '../access'
import { ACTION, MODULE, SUPER_ADMIN_PERMISSION } from '../modules'

describe('buildPermissionCode', () => {
  it('ghép đúng định dạng EWALLET:MODULE:ACTION', () => {
    expect(buildPermissionCode(MODULE.ROLE, ACTION.DELETE)).toBe(
      'EWALLET:ROLE:DELETE'
    )
  })
})

describe('grants', () => {
  it('super-admin đi qua mọi quyền', () => {
    expect(grants([SUPER_ADMIN_PERMISSION], 'EWALLET:ROLE:DELETE')).toBe(true)
    expect(grants([SUPER_ADMIN_PERMISSION], 'EWALLET:USER:CREATE')).toBe(true)
  })

  it('MODULE:FULL bao trùm action cùng module', () => {
    expect(grants(['EWALLET:ROLE:FULL'], 'EWALLET:ROLE:DELETE')).toBe(true)
    expect(grants(['EWALLET:ROLE:FULL'], 'EWALLET:USER:CREATE')).toBe(false)
  })

  it('chỉ chấp nhận quyền khớp chính xác', () => {
    expect(grants(['EWALLET:USER:CREATE'], 'EWALLET:USER:CREATE')).toBe(true)
    expect(grants(['EWALLET:USER:VIEW'], 'EWALLET:USER:CREATE')).toBe(false)
    expect(
      grants(['SOMETHING:ELSE:USER:VIEW'], 'EWALLET:USER:VIEW')
    ).toBe(false)
    expect(grants(['EWALLET:USER:VIEW_ALL'], 'EWALLET:USER:VIEW')).toBe(false)
  })

  it('mảng rỗng chặn module đã phát hành', () => {
    expect(grants([], 'EWALLET:USER:VIEW')).toBe(false)
    expect(grants([], 'EWALLET:ROLE:VIEW')).toBe(false)
    expect(grants([], 'EWALLET:PERMISSION:VIEW')).toBe(false)
    expect(grants([], 'EWALLET:ADMIN:FULL')).toBe(false)
  })

  it('module BE chưa phát hành thì tạm cho qua', () => {
    expect(grants([], 'EWALLET:FEE:UPDATE')).toBe(true)
    expect(grants([], 'EWALLET:WALLET:VIEW')).toBe(true)
    expect(grants([], 'EWALLET:TRANSACTION:VIEW')).toBe(true)
    expect(grants([], 'EWALLET:MERCHANT:CREATE')).toBe(true)
  })
})
