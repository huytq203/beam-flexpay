import { MessageProvider } from '@/app/hooks/useMessage'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import type { FeeAssignment } from '@type/fee.type'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PolicyAssignmentApprovalAction } from '../PolicyAssignmentApprovalAction'

const assignment: FeeAssignment = {
  id: 'assignment-1',
  lockVersion: 2,
  reviewHash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  feePolicyId: 'policy-1',
  merchantId: null,
  bankCode: 'VCB',
  paymentMethod: 'BANK_TRANSFER',
  cardType: null,
  serviceType: 'EWALLET_DEPOSIT',
  customerGroup: null,
  subjectType: null,
  subjectId: null,
  status: 'INIT',
  effectiveFromDate: null,
  effectiveToDate: null
}

const renderAction = (policyStatus: string) =>
  renderWithProviders(
    <MessageProvider>
      <PolicyAssignmentApprovalAction
        feePolicyId='policy-1'
        policyStatus={policyStatus}
      />
    </MessageProvider>
  )

describe('PolicyAssignmentApprovalAction', () => {
  it('hiện nút duyệt bản gán INIT khi chính sách đã ACTIVE', async () => {
    server.use(
      http.get('*/fee/policy-assignments/by-policy/policy-1', () =>
        HttpResponse.json({ success: true, data: [assignment] })
      )
    )

    renderAction('ACTIVE')

    expect(
      await screen.findByRole('button', { name: 'Phê duyệt gán phí' })
    ).toBeEnabled()
  })

  it('không tải hoặc hiện duyệt gán khi chính sách chưa ACTIVE', async () => {
    let requestCount = 0
    server.use(
      http.get('*/fee/policy-assignments/by-policy/policy-1', () => {
        requestCount += 1
        return HttpResponse.json({ success: true, data: [assignment] })
      })
    )

    renderAction('INIT')

    await waitFor(() => expect(requestCount).toBe(0))
    expect(
      screen.queryByRole('button', { name: 'Phê duyệt gán phí' })
    ).not.toBeInTheDocument()
  })

  it('không hiện nút khi bản gán đã được xử lý', async () => {
    let requestCount = 0
    server.use(
      http.get('*/fee/policy-assignments/by-policy/policy-1', () => {
        requestCount += 1
        return HttpResponse.json({
          success: true,
          data: [{ ...assignment, status: 'ACTIVE' }]
        })
      })
    )

    renderAction('ACTIVE')

    await waitFor(() => expect(requestCount).toBe(1))
    expect(
      screen.queryByRole('button', { name: 'Phê duyệt gán phí' })
    ).not.toBeInTheDocument()
  })
})
