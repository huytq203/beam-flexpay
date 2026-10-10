import {
  ButtonComponent,
  CardComponent,
  Table,
  WithdrawalDecisionPanel
} from '@components/index'
import Column from './columns/DetailTransaction.column'
import CommonInfo from './components/CommonInfo'
import InfoUser from './components/InfoUser'
import UserFees from './components/UserFees'
import FeeNCC from './components/FeeNCC'
import { DetailTransactionHeader } from './components/DetailTransactionHeader'
import { TransactionReviewPanel } from './components/TransactionReviewPanel'
import useDetailTransaction from './hooks/useDetailTransaction'
import { useResetTransactionSnapshot } from './hooks/useTransactionSnapshot'
import { formatCurrency } from '@utils/formatNumber'

const DetailTransaction = () => {
  const {
    getTransactionById,
    profit,
    moneyFlow,
    customer,
    isLoading,
    isFetching,
    isError,
    refetch
  } = useDetailTransaction()
  useResetTransactionSnapshot(getTransactionById?.transactionCode)
  const column = Column(getTransactionById?.currency)
  const currency = getTransactionById?.currency ?? 'VND'
  const grossProfit = profit?.grossProfit ?? getTransactionById?.feeAmount
  const grossProfitLabel =
    profit?.grossProfitLabel ?? 'Lợi nhuận gộp (chưa trừ chi phí nhà cung cấp)'

  if (isLoading) {
    return (
      <div className='flex min-h-64 items-center justify-center rounded-md border border-border bg-white p-6 text-gray-600'>
        Đang tải chi tiết giao dịch…
      </div>
    )
  }

  if (isError || !getTransactionById) {
    return (
      <div className='flex min-h-64 flex-col items-center justify-center gap-3 rounded-md border border-red-200 bg-red-50 p-6 text-center'>
        <p className='font-medium text-red-800'>
          Không tải được chi tiết giao dịch.
        </p>
        <p className='text-sm text-red-700'>
          Vui lòng kiểm tra kết nối hoặc thử tải lại dữ liệu.
        </p>
        <ButtonComponent
          type='default'
          content='Thử lại'
          onClick={() => void refetch()}
        />
      </div>
    )
  }

  return (
    <>
      <DetailTransactionHeader transaction={getTransactionById} />
      <TransactionReviewPanel
        className='mb-3'
        transactionCode={getTransactionById.transactionCode}
        transactionType={getTransactionById.transactionType}
        journalStatus={getTransactionById.status}
      />
      <WithdrawalDecisionPanel
        className='mb-3'
        transactionCode={getTransactionById.transactionCode}
        transactionType={getTransactionById.transactionType}
        currency={currency}
      />

      <div className='grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]'>
        <div className='flex min-w-0 flex-col gap-3'>
          <CardComponent content={<CommonInfo data={getTransactionById} />} />

          <CardComponent
            content={
              <UserFees
                data={getTransactionById}
                profit={profit}
              />
            }
          />

          <CardComponent
            content={
              <>
                <div>
                  <p className='font-medium'>Bảng hạch toán luồng tiền</p>
                </div>
                <hr className='my-3' />
                <Table
                  columns={column}
                  dataSource={moneyFlow}
                  rowKey={(row) =>
                    `${row.sequence}-${row.debitAccount ?? ''}-${row.creditAccount ?? ''}`
                  }
                  loading={isFetching}
                  pagination={false}
                  size='small'
                  scroll={{ x: 'max-content' }}
                />
              </>
            }
          />
        </div>

        <div className='flex min-w-0 flex-col gap-3'>
          <CardComponent
            content={
              <InfoUser
                data={getTransactionById}
                customer={customer}
              />
            }
          />

          <CardComponent
            content={
              <FeeNCC
                data={getTransactionById}
                profit={profit}
              />
            }
          />

          <div className='flex min-h-36 flex-col items-center justify-center rounded-md border border-blue-300 bg-blue-50 px-4 py-5 text-center'>
            <p className='font-semibold text-blue-950'>{grossProfitLabel}</p>
            <p className='mt-2 text-xl font-semibold text-green-700'>
              {grossProfit == null
                ? '--'
                : formatCurrency(grossProfit, {
                    symbol: currency,
                    position: 'after'
                  })}
            </p>
            {!profit?.providerCostAvailable && (
              <p className='mt-1 text-sm text-blue-800'>
                Chưa có dữ liệu chi phí nhà cung cấp.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default DetailTransaction
