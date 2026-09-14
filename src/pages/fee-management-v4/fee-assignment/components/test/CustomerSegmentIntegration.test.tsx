import { MessageProvider } from '@hooks/useMessage'
import type { FeeAssignment } from '@type/fee.type'
import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { getFeeAssignColumn } from '../../columns/FeeAssignmentManagement.column'
import { useFeeAssignmentForm } from '../../hook/useFeeAssignmentForm'
import { feeAssignSchema, type FeeAssignType } from '../../schemas/feeAssign.schema'
import FormFieldAssign from '../FormFieldAssign'

const segments = [
  {
    code: 'VIP',
    name: 'Khách hàng thân thiết',
    description: null,
    status: 'ACTIVE'
  }
]

const formValues: FeeAssignType = {
  feePolicyId: 'policy-1',
  merchantId: null,
  bankCode: 'VCB',
  paymentMethod: 'BANK_TRANSFER',
  cardType: '',
  serviceType: 'EWALLET_TRANSFER_INTERNAL',
  customerGroup: '',
  status: 'ACTIVE',
  applyType: '',
  account: ''
}

const FormHarness = ({ customerGroup = '' }: { customerGroup?: string }) => {
  const { control, watch } = useForm<FeeAssignType>({
    defaultValues: { ...formValues, customerGroup }
  })

  return (
    <FormFieldAssign
      control={control}
      feeDomain='EWALLET'
      watch={watch}
    />
  )
}

const hookWrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createAppStore()}>
    <MemoryRouter>
      <MessageProvider>{children}</MessageProvider>
    </MemoryRouter>
  </Provider>
)

const assignment: FeeAssignment = {
  id: 'assignment-1',
  feePolicyId: 'policy-1',
  merchantId: null,
  bankCode: 'VCB',
  paymentMethod: 'BANK_TRANSFER',
  cardType: null,
  serviceType: 'EWALLET_TRANSFER_INTERNAL',
  customerGroup: 'VIP',
  subjectType: null,
  subjectId: null,
  status: 'ACTIVE',
  effectiveFromDate: null,
  effectiveToDate: null
}

describe('tích hợp phân khúc vào gán phí', () => {
  it('đổ dropdown phân khúc từ API và cho phép chọn', async () => {
    server.use(
      http.get('*/fee/customer-segments', () =>
        HttpResponse.json({ data: segments })
      ),
      http.get('*/fee/banks', () =>
        HttpResponse.json({ data: { content: [] } })
      )
    )
    const user = userEvent.setup()

    renderWithProviders(<FormHarness />)

    await user.click(await screen.findByLabelText('Phân khúc khách hàng'))
    await user.click(await screen.findByText('Khách hàng thân thiết'))

    expect(screen.getAllByText('Khách hàng thân thiết').length).toBeGreaterThan(0)
  })

  it('giữ mã cũ khi bản sửa không còn trong danh mục ACTIVE', async () => {
    server.use(
      http.get('*/fee/customer-segments', () =>
        HttpResponse.json({ data: segments })
      ),
      http.get('*/fee/banks', () =>
        HttpResponse.json({ data: { content: [] } })
      )
    )

    renderWithProviders(<FormHarness customerGroup='LEGACY' />)

    expect(await screen.findByText('LEGACY')).toBeInTheDocument()
  })

  it('submit gửi đúng mã phân khúc', async () => {
    let requestBody: unknown = null
    server.use(
      http.post('*/fee/policy-assignments', async ({ request }) => {
        requestBody = await request.json()
        return HttpResponse.json({ data: assignment })
      })
    )
    const { result } = renderHook(() => useFeeAssignmentForm(), {
      wrapper: hookWrapper
    })

    await act(async () => {
      await result.current.handlePostAssign({
        ...formValues,
        customerGroup: 'VIP'
      })
    })

    await waitFor(() =>
      expect(requestBody).toMatchObject({ customerGroup: 'VIP' })
    )
  })

  it('chuẩn hóa phân khúc rỗng thành undefined', () => {
    expect(feeAssignSchema.parse(formValues).customerGroup).toBeUndefined()
  })

  it('cột hiển thị tên phân khúc, fallback mã và Tất cả', () => {
    const columns = getFeeAssignColumn({
      setSelectRowId: () => undefined,
      setOpenModalDelete: () => undefined,
      navigate: () => undefined,
      customerSegmentNames: { VIP: 'Khách hàng thân thiết' }
    })
    const renderCustomerGroup = columns.find(
      (column) => 'dataIndex' in column && column.dataIndex === 'customerGroup'
    )?.render as (value: string | null, record: FeeAssignment, index: number) => ReactNode

    const { rerender } = render(<>{renderCustomerGroup('VIP', assignment, 0)}</>)
    expect(screen.getByText('Khách hàng thân thiết')).toBeInTheDocument()

    rerender(<>{renderCustomerGroup('LEGACY', assignment, 0)}</>)
    expect(screen.getByText('LEGACY')).toBeInTheDocument()

    rerender(<>{renderCustomerGroup(null, assignment, 0)}</>)
    expect(screen.getByText('Tất cả')).toBeInTheDocument()
  })
})
