import { TooltipComponent } from '@components/index'
import StatusBadge from '@components/status-badge/StatusBadge'
import { formatCurrency } from '@utils/formatNumber'
import dayjs from 'dayjs'
import type { ReactNode } from 'react'
import {
  DirectionShortLabel,
  LedgerTransactionType,
  OwnerTypeLabels,
  StatusConstants,
  type DirectionKey,
  type LedgerTransactionTypeKey
} from '../constants/SystemLedger.constant'
import { LedgerEntry } from '../types/SystemLedger.type'

interface RowProps {
  label: string
  children: ReactNode
}

const Row = ({ label, children }: RowProps) => (
  <div className='flex justify-between gap-3'>
    <span className='text-gray-500'>{label}:</span>
    {children}
  </div>
)

interface PanelProps {
  title: string
  children: ReactNode
}

const Panel = ({ title, children }: PanelProps) => (
  <section className='bg-white p-3 rounded-sm border border-border'>
    <h4 className='font-bold text-[12px] mb-2 text-gray-700'>{title}</h4>
    <div className='space-y-1 text-[12px]'>{children}</div>
  </section>
)

const TruncatedHash = ({ value }: { value: string }) => (
  <TooltipComponent title={value}>
    <span className='font-mono text-[10px] tabular-nums'>
      {value.substring(0, 20)}…
    </span>
  </TooltipComponent>
)

/** Ba khối của một dòng sổ cái: giao dịch nguồn, tài khoản, và chính bút toán. */
export const LedgerEntryDetail = ({ record }: { record: LedgerEntry }) => {
  const isCredit = record.direction === 'CREDIT'
  const ownerUsername = record.account?.ownerUsername
  const ownerLabel = ownerUsername
    ? ownerUsername === 'SYSTEM'
      ? 'Hệ thống'
      : ownerUsername
    : '--'

  return (
    <div className='bg-gray-50 p-4 rounded-md'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Panel title='Chi tiết giao dịch'>
          <Row label='Mã giao dịch'>
            <span className='font-medium'>
              {record.transaction?.transactionCode}
            </span>
          </Row>
          <Row label='Tài khoản'>
            <span className='font-medium'>
              {record.transaction?.maskedAccount}
            </span>
          </Row>
          <Row label='Loại giao dịch'>
            <span className='font-medium'>
              {LedgerTransactionType[
                record.transactionType as LedgerTransactionTypeKey
              ] ?? record.transactionType ?? '--'}
            </span>
          </Row>
          <Row label='Tổng tiền'>
            <span className='font-bold tabular-nums'>
              {formatCurrency(record.transaction?.grossAmount)}
            </span>
          </Row>
          <Row label='Thực nhận'>
            <span className='font-medium tabular-nums'>
              {formatCurrency(record.transaction?.netAmount)}
            </span>
          </Row>
          <Row label='Phí'>
            <span className='font-medium tabular-nums text-red-600'>
              {formatCurrency(record.transaction?.feeAmount)}
            </span>
          </Row>
          <Row label='Mô tả'>
            <span className='font-medium'>
              {record.transaction?.description || '--'}
            </span>
          </Row>
          <Row label='Thời gian xử lý'>
            <span className='font-medium tabular-nums'>
              {dayjs(record.transaction?.processedAt).format(
                'DD/MM/YYYY HH:mm:ss'
              )}
            </span>
          </Row>
        </Panel>

        <Panel title='Chi tiết tài khoản'>
          <Row label='Loại tài khoản'>
            <span className='flex flex-col items-end'>
              <span className='font-medium'>
                {OwnerTypeLabels[record.account?.ownerType] ??
                  record.account?.ownerType}
              </span>
              <span className='font-medium text-gray-400'>
                {record.account?.glCode}
              </span>
            </span>
          </Row>
          <Row label='Tài khoản'>
            <span className='font-medium'>{ownerLabel}</span>
          </Row>
          <Row label='Số dư'>
            <span className='font-bold tabular-nums text-green-600'>
              {formatCurrency(record.account?.balance)}
            </span>
          </Row>
          <Row label='Tổng nợ'>
            <span className='font-medium tabular-nums'>
              {formatCurrency(record.account?.totalDebit)}
            </span>
          </Row>
          <Row label='Tổng có'>
            <span className='font-medium tabular-nums'>
              {formatCurrency(record.account?.totalCredit)}
            </span>
          </Row>
          <Row label='Số dư khả dụng'>
            <span className='font-medium tabular-nums'>
              {formatCurrency(record.account?.balance ?? 0)}
            </span>
          </Row>
          <Row label='Trạng thái tài khoản'>
            <StatusBadge
              className='text-[10px]'
              status={record.account?.status as StatusConstants}
            />
          </Row>
        </Panel>

        <Panel title='Chi tiết bút toán'>
          <Row label='Chiều'>
            <span
              className={`font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}
            >
              {DirectionShortLabel[record.direction as DirectionKey]} (
              {record.direction})
            </span>
          </Row>
          <Row label='Số tiền'>
            <span className='font-bold tabular-nums'>
              {formatCurrency(record.amount)}
            </span>
          </Row>
          <Row label='Số dư sau'>
            <span className='font-bold tabular-nums text-blue-600'>
              {formatCurrency(record.balanceAfter)}
            </span>
          </Row>
          <Row label='Số dư bị giữ'>
            <span className='font-medium tabular-nums'>
              {formatCurrency(record.account?.holdBalance)}
            </span>
          </Row>
          <Row label='Ngày ghi sổ'>
            <span className='font-medium tabular-nums'>
              {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss')}
            </span>
          </Row>
          <Row label='Mã bút toán'>
            <TruncatedHash value={record?.journalCode || '--'} />
          </Row>

        </Panel>
      </div>
    </div>
  )
}
