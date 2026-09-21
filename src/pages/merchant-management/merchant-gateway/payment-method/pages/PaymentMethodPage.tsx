import { useState } from 'react'

import { CreditCardOutlined } from '@components/icons'

import { MerchantGatewayPage } from '../../shared/MerchantGatewayPage'
import { MerchantGatewayToolbar } from '../../shared/MerchantGatewayToolbar'
import type { ListState } from '../../shared/merchantGateway.types'
import { PaymentMethodDialog } from '../components/PaymentMethodDialog'
import { PaymentMethodTable } from '../components/PaymentMethodTable'
import { PaymentMethodToolbar } from '../components/PaymentMethodToolbar'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import type { PaymentMethodFormValues } from '../schemas/paymentMethod.schema'
import type { PaymentMethodRow } from '../types/paymentMethod.type'

interface PaymentMethodPageProps {
  initialListState?: ListState
}

const PaymentMethodPage = ({ initialListState }: PaymentMethodPageProps) => {
  const [dialogRow, setDialogRow] = useState<PaymentMethodRow | null | undefined>(
    undefined
  )
  const paymentMethods = usePaymentMethods(initialListState)

  const handleSave = (record: PaymentMethodFormValues & { id?: string }): void => {
    paymentMethods.save(record)
    setDialogRow(undefined)
  }

  return (
    <>
      <MerchantGatewayPage
        createLabel='Thêm hình thức'
        description='Thiết lập hình thức, kênh thanh toán, hạn mức và biểu phí cho merchant.'
        isError={paymentMethods.listState === 'error'}
        isLoading={paymentMethods.listState === 'loading'}
        onCreate={() => setDialogRow(null)}
        screen='MERCHANT_PAYMENT_METHOD'
        title='Hình thức thanh toán'
        titleIcon={<CreditCardOutlined aria-hidden />}
        total={paymentMethods.total}
      >
        <MerchantGatewayToolbar
          search={
            <PaymentMethodToolbar
              filters={paymentMethods.filters}
              onSearch={paymentMethods.setFilters}
            />
          }
        >
          <span className='sr-only'>Bộ lọc hình thức thanh toán</span>
        </MerchantGatewayToolbar>
        <PaymentMethodTable
          filtered={paymentMethods.filtered}
          onEdit={setDialogRow}
          onPageChange={paymentMethods.setPage}
          onRetry={paymentMethods.retry}
          onToggleStatus={paymentMethods.toggleStatus}
          page={paymentMethods.page}
          pageSize={paymentMethods.pageSize}
          rows={paymentMethods.rows}
          state={paymentMethods.listState}
          total={paymentMethods.total}
        />
      </MerchantGatewayPage>
      <PaymentMethodDialog
        open={dialogRow !== undefined}
        row={dialogRow ?? null}
        onCancel={() => setDialogRow(undefined)}
        onSave={handleSave}
      />
    </>
  )
}

export default PaymentMethodPage
