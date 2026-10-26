import dayjs from 'dayjs'
import {
  ButtonComponent,
  StuckReceiptViewButton,
  StuckTransactionUpdateAction
} from '@components/index'
import { ArrowCounterClockwiseIcon, PrinterOutlined } from '@components/icons'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { StatusEnum } from '../constants/Transaction.constant'
import {
  canShowRefundTransactionAction,
  shouldHideStuckUpdateAction
} from '../columns/transaction-row-actions'
import { useCreateRefundDialog } from '../hooks/useCreateRefundDialog'
import { useTransactionPermissions } from '../hooks/useTransactionPermissions'
import { CreateRefundDialog } from './CreateRefundDialog'

interface DetailTransactionHeaderProps {
  transaction: UnifiedContentJournal
}

/** Tiêu đề và các nút hành động; ma trận nút theo trạng thái, đóng băng và quyền. */
export function DetailTransactionHeader({
  transaction
}: DetailTransactionHeaderProps) {
  const { canFull } = useTransactionPermissions()
  const refundDialog = useCreateRefundDialog()

  return (
    <>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-3 px-2'>
        <div className='min-w-0 flex-1'>
          <p className='break-words text-xl font-bold'>
            Chi tiết giao dịch:{' '}
            <span className='text-blue-700'>{transaction.transactionCode}</span>
          </p>
          <p className='text-sm text-gray-500'>
            {dayjs.utc(transaction.createdAt).format('DD/MM/YYYY HH:mm:ss')}
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <ButtonComponent
            icon={<PrinterOutlined />}
            type='default'
            content='In phiếu'
          />
          <StuckTransactionUpdateAction
            transactionCode={transaction.transactionCode}
            transactionType={transaction.transactionType}
            journalStatus={transaction.status}
            hidden={shouldHideStuckUpdateAction(transaction)}
          />
          {transaction.status === StatusEnum.POSTED && (
            <StuckReceiptViewButton
              transactionCode={transaction.transactionCode}
            />
          )}
          {canFull && canShowRefundTransactionAction(transaction) && (
            <ButtonComponent
              icon={
                <ArrowCounterClockwiseIcon
                  size={16}
                  weight='bold'
                />
              }
              content='Hoàn tiền'
              onClick={() => refundDialog.open(transaction)}
            />
          )}
        </div>
      </div>
      {refundDialog.target && (
        <CreateRefundDialog
          transaction={refundDialog.target}
          onClose={refundDialog.close}
        />
      )}
    </>
  )
}
