import type {
  WalletLimitPolicy,
  WalletLimitTransactionType
} from '@type/walletLimit.type'
import { describe, expect, it } from 'vitest'
import type { WalletLimitFormValues } from '../schemas/walletLimitForm.schema'
import {
  buildEmptyFormValues,
  buildEmptyOverride,
  formValuesToCreateBody,
  formValuesToUpdateBody,
  getInapplicableKeys,
  getSystemRequiredKeys,
  mapServerFieldErrors,
  policyToFormValues,
  toNumberOrNull
} from '../utils/walletLimit.formMapper'

const policy: WalletLimitPolicy = {
  id: 'p-1',
  scopeType: 'WALLET',
  targetId: 'w-1',
  targetDisplay: '0912345678',
  walletType: 'ALL',
  transactionType: 'WITHDRAWAL',
  minPerTransaction: 10000,
  maxPerTransaction: 5000000,
  dailyMaximum: 10000000,
  normalMonthlyMaximum: null,
  specialMonthlyMaximum: null,
  walletBalanceMaximum: null,
  outflowDailyMaximum: 4000000,
  outflowMonthlyMaximum: null,
  outboundMaxTimesPerDay: 3,
  approvalThreshold: null,
  status: 'ACTIVE',
  bankOverrides: [
    {
      id: 'o-1',
      policyId: 'p-1',
      transactionType: 'WITHDRAWAL',
      bankCode: 'VCB',
      paymentMethod: null,
      minPerTransaction: 10000,
      maxPerTransaction: 5000000,
      dailyMaximum: 5000000,
      normalMonthlyMaximum: null,
      specialMonthlyMaximum: null
    }
  ],
  createdAt: '2026-10-08T03:10:00Z',
  createdByUsername: 'admin',
  updatedAt: null,
  updatedByUsername: null,
  rowVersion: 4
}

const filled = (
  patch: Partial<WalletLimitFormValues> = {}
): WalletLimitFormValues => ({
  ...buildEmptyFormValues(),
  scopeType: 'WALLET',
  targetScope: 'WALLET',
  targetId: 'w-1',
  targetDisplay: '0912345678',
  transactionType: 'ALL',
  minPerTransaction: 1000,
  maxPerTransaction: 2000,
  dailyMaximum: 3000,
  walletBalanceMaximum: 9000,
  outflowDailyMaximum: 4000,
  approvalThreshold: 500,
  ...patch
})

describe('toNumberOrNull', () => {
  it('đưa chuỗi rỗng, undefined, NaN về null', () => {
    expect(toNumberOrNull('')).toBeNull()
    expect(toNumberOrNull(undefined)).toBeNull()
    expect(toNumberOrNull(Number.NaN)).toBeNull()
    expect(toNumberOrNull(0)).toBe(0)
  })
})

describe('policyToFormValues', () => {
  it('đổ bản gốc vào form, ô thiếu thành null và giữ rowVersion', () => {
    const values = policyToFormValues(policy)
    expect(values).toMatchObject({
      scopeType: 'WALLET',
      targetScope: 'WALLET',
      targetId: 'w-1',
      targetDisplay: '0912345678',
      status: 'ACTIVE',
      rowVersion: 4,
      normalMonthlyMaximum: null,
      specialMonthlyMaximum: null,
      outboundMaxTimesPerDay: 3
    })
    expect(values.bankOverrides).toEqual([
      {
        ...buildEmptyOverride('WITHDRAWAL'),
        bankCode: 'VCB',
        paymentMethod: '',
        minPerTransaction: 10000,
        maxPerTransaction: 5000000,
        dailyMaximum: 5000000
      }
    ])
  })
})

describe('formValuesToCreateBody', () => {
  it('gửi đúng khóa tạo mới, không có trường cũ', () => {
    const body = formValuesToCreateBody(filled())
    expect(Object.keys(body).sort()).toEqual(
      [
        'scopeType',
        'targetId',
        'walletType',
        'transactionType',
        'minPerTransaction',
        'maxPerTransaction',
        'dailyMaximum',
        'normalMonthlyMaximum',
        'specialMonthlyMaximum',
        'walletBalanceMaximum',
        'outflowDailyMaximum',
        'outflowMonthlyMaximum',
        'outboundMaxTimesPerDay',
        'approvalThreshold',
        'bankOverrides'
      ].sort()
    )
    expect(body).toMatchObject({
      scopeType: 'WALLET',
      targetId: 'w-1',
      walletType: 'ALL',
      walletBalanceMaximum: 9000,
      normalMonthlyMaximum: null
    })
  })

  it('SYSTEM gửi targetId null; loại khác ALL gửi sức chứa null', () => {
    const body = formValuesToCreateBody(
      filled({ scopeType: 'SYSTEM', transactionType: 'WITHDRAWAL' })
    )
    expect(body.targetId).toBeNull()
    expect(body.walletBalanceMaximum).toBeNull()
    expect(body.outflowDailyMaximum).toBe(4000)
  })

  it('Nạp tiền gửi null cho ô chi, sức chứa và ngưỡng duyệt', () => {
    const body = formValuesToCreateBody(filled({ transactionType: 'DEPOSIT' }))
    expect(body).toMatchObject({
      walletBalanceMaximum: null,
      outflowDailyMaximum: null,
      outflowMonthlyMaximum: null,
      outboundMaxTimesPerDay: null,
      approvalThreshold: null
    })
  })

  it('dòng override: chuyển tiền bỏ ngân hàng, rỗng thành null', () => {
    const row = {
      ...buildEmptyOverride('TRANSFER' as WalletLimitTransactionType),
      bankCode: 'VCB',
      paymentMethod: 'WALLET_BALANCE' as const,
      minPerTransaction: 1,
      maxPerTransaction: 2,
      dailyMaximum: 3
    }
    const [mapped] = formValuesToCreateBody(
      filled({ bankOverrides: [row] })
    ).bankOverrides
    expect(mapped).toEqual({
      transactionType: 'TRANSFER',
      bankCode: null,
      paymentMethod: 'WALLET_BALANCE',
      minPerTransaction: 1,
      maxPerTransaction: 2,
      dailyMaximum: 3,
      normalMonthlyMaximum: null,
      specialMonthlyMaximum: null
    })
  })
})

describe('formValuesToUpdateBody', () => {
  it('có status và rowVersion, không có scope/target/walletType', () => {
    const body = formValuesToUpdateBody(
      filled({ status: 'LOCKED', rowVersion: 7, bankOverrides: [] })
    )
    expect(body).toMatchObject({
      status: 'LOCKED',
      rowVersion: 7,
      bankOverrides: []
    })
    expect(body).not.toHaveProperty('scopeType')
    expect(body).not.toHaveProperty('targetId')
    expect(body).not.toHaveProperty('walletType')
  })
})

describe('getSystemRequiredKeys / getInapplicableKeys', () => {
  it('chỉ SYSTEM có ô bắt buộc, theo ô đang có giá trị', () => {
    expect(getSystemRequiredKeys(policy)).toEqual([])
    const required = getSystemRequiredKeys({
      ...policy,
      scopeType: 'SYSTEM'
    })
    expect(required).toContain('dailyMaximum')
    expect(required).toContain('outboundMaxTimesPerDay')
    expect(required).not.toContain('walletBalanceMaximum')
  })

  it('ô khóa theo loại giao dịch', () => {
    expect(getInapplicableKeys('ALL')).toEqual([])
    expect(getInapplicableKeys('DEPOSIT')).toEqual([
      'walletBalanceMaximum',
      'outflowDailyMaximum',
      'outflowMonthlyMaximum',
      'outboundMaxTimesPerDay',
      'approvalThreshold'
    ])
    expect(getInapplicableKeys('TRANSFER')).toEqual([
      'walletBalanceMaximum',
      'approvalThreshold'
    ])
  })
})

describe('mapServerFieldErrors', () => {
  it('đổi bankOverrides[0].x sang đường dẫn field array, trường lạ vào unmapped', () => {
    expect(
      mapServerFieldErrors({
        minPerTransaction: 'Sai min.',
        'bankOverrides[2].dailyMaximum': 'Sai ngày.',
        rowVersion: 'Thiếu phiên bản.'
      })
    ).toEqual({
      errors: [
        { name: 'minPerTransaction', message: 'Sai min.' },
        { name: 'bankOverrides.2.dailyMaximum', message: 'Sai ngày.' }
      ],
      unmapped: ['Thiếu phiên bản.']
    })
  })
})
