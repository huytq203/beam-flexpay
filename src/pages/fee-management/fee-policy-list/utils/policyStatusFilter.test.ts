import { describe, expect, it } from 'vitest'
import { splitPolicyStatusFilter } from './policyStatusFilter'

describe('splitPolicyStatusFilter', () => {
  it.each(['PENDING', 'ACTIVE', 'EXPIRED'])(
    '%s là trạng thái hiệu lực',
    (value) => {
      expect(splitPolicyStatusFilter(value)).toEqual({ effectiveStatus: value })
    }
  )

  it.each(['INIT', 'REJECTED', 'INACTIVE', 'LOCKED'])(
    '%s là status thô của backend',
    (value) => {
      expect(splitPolicyStatusFilter(value)).toEqual({ status: value })
    }
  )

  it('rỗng thì không lọc', () => {
    expect(splitPolicyStatusFilter('')).toEqual({})
    expect(splitPolicyStatusFilter(undefined)).toEqual({})
  })
})
