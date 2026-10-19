import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import type { FeePolicyRow } from '@pages/fee-management/fee-policy-list/hooks/useFeePolicyList'
import { render, screen } from '@testing-library/react'
import { Table } from 'antd'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'
import { getFeePolicyColumns } from '../FeePolicyList.column'

const policy = {
  id: 'policy-editable',
  key: 'policy-editable',
  no: 1,
  name: 'Biểu phí có thể sửa',
  serviceType: 'EWALLET_DEPOSIT',
  feeDomain: 'EWALLET',
  currency: 'VND',
  validFrom: '2026-09-01',
  validTo: null,
  status: 'INIT',
  priority: 1
} satisfies FeePolicyRow

const renderColumns = () => {
  const store = createAppStore()
  store.dispatch(savePermissions(['EWALLET:FEE:UPDATE']))
  const dataSource: FeePolicyRow[] = [
    policy,
    {
      ...policy,
      id: 'policy-readonly',
      key: 'policy-readonly',
      no: 2,
      name: 'Biểu phí không thể sửa',
      status: 'INACTIVE'
    },
    {
      ...policy,
      id: 'policy-rejected',
      key: 'policy-rejected',
      no: 3,
      name: 'Biểu phí bị từ chối',
      status: 'REJECTED'
    }
  ]

  return render(
    <Provider store={store}>
      <Table
        rowKey='id'
        dataSource={dataSource}
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
}

describe('cột hành động danh sách chính sách phí', () => {
  it('chỉ hiện sửa cấu hình cho chính sách chưa duyệt, ẩn với bản bị từ chối', () => {
    renderColumns()

    expect(screen.getAllByLabelText('Sửa cấu hình')).toHaveLength(1)
    expect(screen.queryByLabelText('Xem chi tiết')).toBeNull()
  })

  it('biểu phí hết hạn ẩn mọi thao tác, kể cả bản đang ACTIVE mà BE báo EXPIRED', () => {
    const store = createAppStore()
    store.dispatch(
      savePermissions(['EWALLET:FEE:UPDATE', 'EWALLET:FEE:APPROVE'])
    )
    const expiredActive: FeePolicyRow = {
      ...policy,
      id: 'policy-expired-active',
      key: 'policy-expired-active',
      name: 'Hết hạn đang ACTIVE',
      status: 'ACTIVE',
      effectiveStatus: 'EXPIRED'
    }
    const expiredInit: FeePolicyRow = {
      ...policy,
      id: 'policy-expired-init',
      key: 'policy-expired-init',
      name: 'Hết hạn chưa duyệt',
      validTo: '2020-01-01'
    }
    const { container } = render(
      <Provider store={store}>
        <Table
          rowKey='id'
          dataSource={[expiredActive, expiredInit]}
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

    expect(screen.getAllByText('Hết hạn')).toHaveLength(2)
    expect(container.querySelectorAll('tbody td button')).toHaveLength(0)
  })
})
