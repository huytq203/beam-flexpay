import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import type {
  ReconciliationEquation,
  ReconciliationResult,
  SettlementPause,
  SubBalanceReport
} from '../types/reconciliation.types'

export const BASE = '*/merchant-reconciliations'
export const SUB_ID = 'sub-1'

export const equation = (
  over: Partial<ReconciliationEquation> = {}
): ReconciliationEquation => ({
  no: 1,
  code: 'AVAILABLE',
  label: 'Số dư khả dụng = tổng có dấu các dòng Sẵn sàng rút',
  ledger: 5200000,
  detail: 5000000,
  difference: 200000,
  ok: false,
  ...over
})

export const result = (
  over: Partial<ReconciliationResult> = {}
): ReconciliationResult => ({
  id: 'res-1',
  masterId: 'm-1',
  subMerchantId: SUB_ID,
  businessDate: '2026-10-22',
  runNo: 2,
  trigger: 'ON_DEMAND',
  result: 'MISMATCH',
  equations: [
    equation(),
    equation({
      no: 3,
      code: 'ORDER_FREEZE',
      label: 'Đóng băng theo lệnh',
      ledger: 0,
      detail: 0,
      difference: 0,
      ok: true
    }),
    equation({
      no: 7,
      code: 'ITEM_COMPOSITION',
      label: 'Mỗi mục: giá trị gộp = phí + doanh thu ghi nhận',
      ledger: 0,
      detail: 2,
      difference: -2,
      ok: false
    })
  ],
  mismatchCount: 2,
  createdAt: '2026-10-22T03:15:30.123Z',
  ...over
})

export const pause = (
  over: Partial<SettlementPause> = {}
): SettlementPause => ({
  id: 'pause-1',
  masterId: 'm-1',
  subMerchantId: SUB_ID,
  resultId: 'res-1',
  reason: '(1) Số dư khả dụng: sổ 5200000, chi tiết 5000000, lệch 200000',
  since: '2026-10-21T20:00:12.000Z',
  escalated: true,
  ...over
})

export const balanceReport = (
  over: Partial<SubBalanceReport> = {}
): SubBalanceReport => {
  const line = (
    code: SubBalanceReport['available']['code'],
    label: string,
    amount: number
  ) => ({ code, label, amount, explanation: `Giải thích ${label}` })
  return {
    subMerchantId: SUB_ID,
    subCode: 'SM0001',
    subName: 'Cửa hàng Quận 1',
    revenueBalance: 8500000,
    availableBalance: 5000000,
    pendingSettlement: 2000000,
    frozenTotal: 1500000,
    available: line('AVAILABLE', 'Số dư khả dụng', 5000000),
    pending: line('PENDING_SETTLEMENT', 'Chờ quyết toán', 2000000),
    ruleHold: line('RULE_HOLD', 'Tạm giữ theo quy tắc', 1000000),
    orderFreeze: line('ORDER_FREEZE', 'Đóng băng theo lệnh', 0),
    withdrawalInProcess: line(
      'WITHDRAWAL_IN_PROCESS',
      'Lệnh rút đang xử lý',
      500000
    ),
    waitingEscrow: line('WAITING_ESCROW', 'Chờ nạp ký quỹ', 0),
    asOf: '2026-10-22T03:15:30.123Z',
    ...over
  }
}

/** BE `pauses` không trả tên Sub nên màn tra chi tiết Sub-merchant. */
export const mockSubDetail = () =>
  server.use(
    http.get('*/sub-merchants/:id', ({ params }) =>
      HttpResponse.json({
        data: {
          id: params.id,
          code: 'SM0001',
          name: 'Cửa hàng Quận 1',
          merchantId: 'm-1',
          merchantName: 'Merchant A',
          status: 'ACTIVE'
        }
      })
    )
  )

export const mockPauses = (rows: SettlementPause[] = [pause()]) =>
  server.use(
    http.get(`${BASE}/pauses`, () => HttpResponse.json({ data: rows }))
  )

export const apiError = (message: string, detail: string, httpStatus: number) =>
  HttpResponse.json(
    { success: false, message, status: '0', detail },
    { status: httpStatus }
  )
