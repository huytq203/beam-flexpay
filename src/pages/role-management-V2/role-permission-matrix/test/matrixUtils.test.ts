import { describe, expect, it } from 'vitest'
import { selfLockoutRisk, toCallerRoles } from '../utils/matrixCaller.utils'
import {
  buildUpdateBody,
  setAccessType,
  toDraft,
  validateReason
} from '../utils/matrixDraft.utils'
import { getMatrixErrorMessage } from '../utils/matrixError.utils'
import { groupMatrixRows } from '../utils/matrixGroups.utils'
import { matrixFixture } from './rolePermissionMatrix.setup'

describe('matrix utils', () => {
  it('gỡ sạch quyền gửi permissions rỗng, không bỏ chức năng nào khỏi nhóm', () => {
    const matrix = matrixFixture()
    let draft = toDraft(matrix, 'SALES')
    for (const code of Object.keys(draft))
      draft = setAccessType(draft, code, null)
    expect(buildUpdateBody(matrix, draft, ' Thu hồi ')).toEqual({
      reason: 'Thu hồi',
      permissions: []
    })
    const total = groupMatrixRows(matrix.functions).reduce(
      (sum, group) => sum + group.rows.length,
      0
    )
    expect(total).toBe(matrix.functions.length)
  })

  it('chặn lý do trống và dài quá 255 ký tự', () => {
    expect(validateReason('   ')).toBe('Lý do không được để trống')
    expect(validateReason('a'.repeat(256))).toMatch(/255/)
    expect(validateReason('a'.repeat(255))).toBe('')
  })

  it('map lỗi theo message, ưu tiên detail cụ thể của lỗi nghiệp vụ', () => {
    const error = (message: string, detail?: string) => ({
      status: 400,
      data: { message, detail }
    })
    expect(
      getMatrixErrorMessage(
        error(
          'ADMIN_ROLE_PERMISSION_DUPLICATE_FUNCTION',
          'Trùng: MERCHANT_LIST'
        ),
        'x'
      )
    ).toBe('Trùng: MERCHANT_LIST')
    expect(
      getMatrixErrorMessage(error('INTERNAL_SERVER_ERROR', 'Lỗi'), 'x')
    ).toBe('Hệ thống đang gặp lỗi, vui lòng thử lại sau')
    expect(getMatrixErrorMessage(undefined, 'Không thể lưu')).toBe(
      'Không thể lưu'
    )
  })

  it('đánh giá nguy cơ tự khóa theo vai trò của người gọi', () => {
    expect(toCallerRoles(['ROLE_ADMIN', 'offline_access'])).toEqual(['ADMIN'])
    expect(selfLockoutRisk('ADMIN', ['SUPER_ADMIN'])).toBe('none')
    expect(selfLockoutRisk('ADMIN', ['ADMIN'])).toBe('own-role')
    expect(selfLockoutRisk('SALES', ['ADMIN'])).toBe('none')
    expect(selfLockoutRisk('SALES', [])).toBe('unknown')
  })
})
