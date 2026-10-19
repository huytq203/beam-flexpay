import { createAppStore } from '@/app/store'
import type { FeePolicyRow } from '@pages/fee-management/fee-policy-list/hooks/useFeePolicyList'
import { render, screen, within } from '@testing-library/react'
import { Table } from 'antd'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'
import { getFeePolicyColumns } from '../FeePolicyList.column'

const policy = {
  id: 'policy-with-code',
  key: 'policy-with-code',
  no: 1,
  feeCode: 'FF26BH44R',
  name: 'Phí nạp ví',
  serviceType: 'EWALLET_DEPOSIT',
  feeDomain: 'EWALLET',
  currency: 'VND',
  validFrom: '2026-09-01',
  validTo: null,
  status: 'INIT',
  priority: 1
} satisfies FeePolicyRow

describe('cột mã phí danh sách chính sách phí', () => {
  it('hiện mã đối soát kèm nút sao chép, và -- khi BE cũ chưa trả mã', () => {
    const legacy: FeePolicyRow = {
      ...policy,
      id: 'policy-legacy',
      key: 'policy-legacy',
      no: 2,
      feeCode: undefined
    }
    render(
      <Provider store={createAppStore()}>
        <Table
          rowKey='id'
          dataSource={[policy, legacy]}
          pagination={false}
          columns={getFeePolicyColumns({
            feeScope: 'OUTPUT_FEE',
            onEdit: vi.fn(),
            onChangeStatus: vi.fn(),
            customerSegmentNames: {}
          })}
        />
      </Provider>
    )

    expect(screen.getByRole('columnheader', { name: 'Mã phí' })).toBeTruthy()
    const [withCode, withoutCode] = screen.getAllByRole('row').slice(1)
    expect(within(withCode).getByText('FF26BH44R')).toBeTruthy()
    expect(within(withCode).getByLabelText('Sao chép FF26BH44R')).toBeTruthy()
    expect(within(withoutCode).getByText('--')).toBeTruthy()
  })
})
