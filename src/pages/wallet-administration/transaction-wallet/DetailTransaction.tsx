import {
  ButtonComponent,
  CardComponent,
  WithdrawalDecisionPanel
} from '@components/index'
import Column from './columns/DetailTransaction.column'
import CommonInfo from './components/CommonInfo'
import InfoUser from './components/InfoUser'
import UserFees from './components/UserFees'
import FeeNCC from './components/FeeNCC'
import { DetailTransactionHeader } from './components/DetailTransactionHeader'
import { TransactionRefundList } from './components/TransactionRefundList'
import useDetailTransaction from './hooks/useDetailTransaction'
import { useResetTransactionSnapshot } from './hooks/useTransactionSnapshot'
import { GrossProfitCard } from './components/GrossProfitCard'
import { buildGrossProfit } from './utils/grossProfit'

const DetailTransaction = () => {
  const {
    getTransactionById,
    profit,
    fee,
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
      <WithdrawalDecisionPanel
        className='mb-3'
        transactionCode={getTransactionById.transactionCode}
        transactionType={getTransactionById.transactionType}
        currency={currency}
      />

      <div className='grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]'>
        <div className='flex min-w-0 flex-col gap-3'>
          <CardComponent
            content={
              <CommonInfo
                data={getTransactionById}
                feeCode={fee?.feeCode}
              />
            }
          />

          <CardComponent
            content={
              <UserFees
                data={getTransactionById}
                profit={profit}
                fee={fee}
              />
            }
          />

          {/* <CardComponent
            content={
              <>
                <DetailSectionTitle>
                  Bảng hạch toán luồng tiền
                </DetailSectionTitle>
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
          /> */}

          <CardComponent
            content={
              <TransactionRefundList
                refunds={getTransactionById.refunds}
                currency={currency}
              />
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
                fee={fee}
              />
            }
          />

          <GrossProfitCard
            profit={buildGrossProfit(getTransactionById, profit, fee)}
            currency={currency}
          />
        </div>
      </div>
    </>
  )
}

export default DetailTransaction
