import { describe, expect, it } from 'vitest'
import { diffIds, withSubMerchantParents } from '../scopeProposalDiff'

describe('diffIds', () => {
  it('tách phần giữ, thêm và gỡ', () => {
    expect(diffIds(['a', 'b'], ['b', 'c'])).toEqual({
      kept: ['b'],
      added: ['c'],
      removed: ['a']
    })
  })
})

describe('withSubMerchantParents', () => {
  it('cộng Merchant cha của Sub vào để so cùng cách với danh sách User', () => {
    const parent = (id: string) => (id === 's1' ? 'm2' : undefined)
    expect(withSubMerchantParents(['m1'], ['s1'], parent).sort()).toEqual([
      'm1',
      'm2'
    ])
  })

  it('không nhân đôi khi cha đã có sẵn', () => {
    expect(withSubMerchantParents(['m1'], ['s1'], () => 'm1')).toEqual(['m1'])
  })
})
