import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import type { HoldRuleChange, HoldRulePolicy } from '../types/holdRule.types'

export const BASE = '*/merchant-hold-rules'

export const change = (over: Partial<HoldRuleChange> = {}): HoldRuleChange => ({
  id: 'rule-1',
  policyDomain: 'HOLD_RULE',
  targetLevel: 'SYSTEM',
  targetId: null,
  version: 3,
  approvalStatus: 'PENDING_APPROVAL',
  proposedConfig: { enabled: true, ratePercent: 5, holdDays: 7 },
  activeFrom: '2026-10-25T00:00:00Z',
  activeUntil: null,
  authorId: 'u-author',
  approverId: null,
  changeReason: 'Tăng tạm giữ theo đánh giá rủi ro',
  createdAt: '2026-10-22T03:15:30.123Z',
  approvedAt: null,
  ...over
})

export const policy = (over: Partial<HoldRulePolicy> = {}): HoldRulePolicy => ({
  enabled: true,
  calculationMode: 'PERCENT_OF_GROSS',
  ratePercent: 5,
  fixedAmount: null,
  holdDays: 7,
  minimumGrossAmount: 0,
  paymentMethods: [],
  capEnabled: false,
  capMode: null,
  capAmount: null,
  capPercent: null,
  capBehaviour: null,
  sources: {
    enabled: 'SYSTEM',
    calculationMode: 'SYSTEM',
    ratePercent: 'SYSTEM',
    holdDays: 'SYSTEM'
  },
  policyVersionIds: ['v-1'],
  ...over
})

/** BE chỉ trả UUID của người đề xuất nên màn tra tên trong danh bạ admin. */
export const mockAdminUsers = () =>
  server.use(
    http.get('*/users/managers/:id', ({ params }) =>
      HttpResponse.json({
        data: {
          id: params.id,
          username: String(params.id),
          firstName: 'Lan',
          lastName: 'Trần'
        }
      })
    )
  )

export const mockLists = (
  pending: HoldRuleChange[] = [],
  history: HoldRuleChange[] = [],
  effective: HoldRulePolicy = policy()
) => {
  mockAdminUsers()
  server.use(
    http.get(`${BASE}/pending`, () => HttpResponse.json({ data: pending })),
    http.get(`${BASE}/history`, () => HttpResponse.json({ data: history })),
    http.get(`${BASE}/effective`, () => HttpResponse.json({ data: effective }))
  )
}
