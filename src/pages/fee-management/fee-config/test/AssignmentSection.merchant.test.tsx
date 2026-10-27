import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { AssignmentSection } from '../components/AssignmentSection'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'
import { baseForm } from './feeConfigPayload.fixtures'

const Harness = ({ values }: { values: FeeConfigFormValues }) => {
  const { control } = useForm<FeeConfigFormValues>({ defaultValues: values })
  return <AssignmentSection control={control} />
}

const renderSection = (overrides: Partial<FeeConfigFormValues>) => {
  server.use(
    http.get('*/fee/banks', () =>
      HttpResponse.json({ success: true, data: { content: [] } })
    ),
    // Nạp ví có ô NCC nên gọi danh sách đối tác thanh toán.
    http.get('*/fee/payment-partners', () =>
      HttpResponse.json({ success: true, data: [] })
    )
  )
  return renderWithProviders(<Harness values={baseForm(overrides)} />)
}

const merchantFlow = {
  feeDomain: 'MERCHANT' as const,
  serviceType: 'MERCHANT_VA_BILL_COLLECTION',
  paymentMethod: ''
}

describe('AssignmentSection — thu hộ / chi hộ', () => {
  it('Tất cả merchant: không hiện ô chọn merchant, có dòng gợi ý ưu tiên', () => {
    renderSection({ ...merchantFlow, assignmentScope: 'ALL' })

    expect(screen.getByText('Tất cả merchant')).toBeInTheDocument()
    expect(
      screen.queryByText('Đơn vị chấp nhận thanh toán')
    ).not.toBeInTheDocument()
    expect(screen.getByText(/Merchant cụ thể được ưu tiên/)).toBeInTheDocument()
  })

  it('Merchant cụ thể hiện ô chọn merchant, không hiện ô cá nhân', () => {
    renderSection({ ...merchantFlow, assignmentScope: 'SUBJECT' })

    expect(screen.getByText('Merchant cụ thể')).toBeInTheDocument()
    expect(screen.getByText('Đơn vị chấp nhận thanh toán')).toBeInTheDocument()
  })

  it('Nhóm merchant hiện ô nhóm với nhãn merchant', async () => {
    server.use(
      http.get('*/customer-segments*', () =>
        HttpResponse.json({ success: true, data: [] })
      )
    )
    renderSection({ ...merchantFlow, assignmentScope: 'SEGMENT' })

    expect(await screen.findByLabelText(/Nhóm merchant/)).toBeInTheDocument()
    expect(screen.queryByText('Nhóm khách hàng')).not.toBeInTheDocument()
  })

  it('luồng ví giữ nhãn khách hàng và không có dòng gợi ý merchant', () => {
    renderSection({
      serviceType: 'EWALLET_DEPOSIT',
      paymentMethod: '',
      assignmentScope: 'ALL'
    })

    expect(screen.getByText('Tất cả khách hàng')).toBeInTheDocument()
    expect(screen.queryByText('Tất cả merchant')).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Merchant cụ thể được ưu tiên/)
    ).not.toBeInTheDocument()
  })
})
