import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@/app/hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { FeeDomain } from '@components/fee/feeDomain'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import FeeConfig from '../FeeConfig'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'

const mockUseFeeConfigDetail = vi.hoisted(() => vi.fn())

vi.mock('../hooks/useFeeConfigDetail', () => ({
  useFeeConfigDetail: mockUseFeeConfigDetail
}))

const values: FeeConfigFormValues = {
  feeDomain: FeeDomain.EWALLET,
  name: 'Phí nạp tiền VPBank',
  description: 'Chính sách đã được duyệt',
  priority: 2,
  serviceType: 'EWALLET_DEPOSIT',
  validFrom: '2026-09-11T08:30:00.000',
  validTo: '',
  bankCode: 'VPB',
  paymentMethod: 'ATM',
  merchantId: '',
  subjectId: '',
  assignmentScope: 'ALL',
  customerGroup: '',
  components: [
    {
      key: 'component-1',
      componentType: 'TRANSACTION_FEE',
      baseOn: 'AMOUNT',
      baseComponentType: null,
      calculationMethod: 'DIRECT',
      payerType: 'USER',
      beneficiaryType: 'SYSTEM',
      fixedAmount: 5000,
      percentage: null,
      minFee: null,
      maxFee: null,
      roundMode: 'UP',
      tiers: []
    }
  ]
}

describe('FeeConfig read-only detail', () => {
  it('hiển thị toàn bộ cấu hình nhưng không cho thay đổi', () => {
    server.use(
      http.get('*/fee/banks', () =>
        HttpResponse.json({ success: true, data: { content: [] } })
      )
    )
    mockUseFeeConfigDetail.mockReturnValue({
      values,
      snapshot: {
        policyId: 'policy-1',
        componentIds: ['component-1'],
        assignmentId: 'assignment-1'
      },
      isEditable: false,
      isLoading: false,
      isError: false
    })

    renderWithProviders(
      <MessageProvider>
        <Routes>
          <Route path='/fee/edit/:id' element={<FeeConfig />} />
        </Routes>
      </MessageProvider>,
      { route: '/fee/edit/policy-1' }
    )

    expect(screen.getByText('Đang xem chi tiết chính sách')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Phí nạp tiền VPBank')).toBeDisabled()
    expect(screen.getByText('1. Phí giao dịch cơ bản')).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: /Về danh sách/ })
    ).toHaveLength(2)
    screen.getAllByRole('button', { name: /Về danh sách/ }).forEach((button) =>
      expect(button).toBeEnabled()
    )
    expect(
      screen.queryByRole('button', { name: 'Thiết lập' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Thêm phí thành phần' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Sửa thành phần' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Xoá thành phần' })
    ).not.toBeInTheDocument()
  })
})
