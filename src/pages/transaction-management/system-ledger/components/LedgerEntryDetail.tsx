import StatusBadge from '@components/status-badge/StatusBadge'
import { formatCurrency } from '@utils/formatNumber'
import dayjs from 'dayjs'
import type { ReactNode } from 'react'
import {
  DirectionShortLabel,
  FeeBearerLabel,
  LedgerTransactionType,
  OwnerTypeLabels,
  StatusConstants,
  type DirectionKey,
  type LedgerTransactionTypeKey
} from '../constants/SystemLedger.constant'
import { LedgerEntry } from '@type/systemLedger'

interface RowProps {
  label: string
  children: ReactNode
}

const Row = ({ label, children }: RowProps) => (
  <div className='flex justify-between gap-3'>
    <span className='text-muted-foreground'>{label}:</span>
    {children}
  </div>
)

interface PanelProps {
  title: string
  children: ReactNode
}

const Panel = ({ title, children }: PanelProps) => (
  <section className='rounded-lg border border-border bg-background p-3'>
    <h4 className='mb-2 text-xs font-semibold'>{title}</h4>
    <div className='space-y-1 text-xs'>{children}</div>
  </section>
)

/** Ba khối của một dòng sổ cái: giao dịch nguồn, tài khoản, và chính bút toán. */
export const LedgerEntryDetail = ({ record }: { record: LedgerEntry }) => {
  const ownerUsername = record.account?.ownerUsername
  const ownerLabel = ownerUsername
    ? ownerUsername === 'SYSTEM'
      ? 'Hệ thống'
      : ownerUsername
    : '--'

  return (
    <div className='rounded-lg bg-muted p-4'>
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
              ] ??
                record.transactionType ??
                '--'}
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
            <span className='font-medium tabular-nums'>
              {formatCurrency(record.transaction?.feeAmount)}
            </span>
          </Row>
          {record.feeBearer && (
            <Row label='Bên chịu phí'>
              <span className='font-medium'>
                {FeeBearerLabel[record.feeBearer]}
              </span>
            </Row>
          )}
          {record.feeBearer === 'BOTH' &&
            record.senderFeeAmount != null &&
            record.receiverFeeAmount != null && (
              <>
                <Row label='Phí bên gửi'>
                  <span className='font-medium tabular-nums'>
                    {formatCurrency(record.senderFeeAmount)}
                  </span>
                </Row>
                <Row label='Phí bên nhận'>
                  <span className='font-medium tabular-nums'>
                    {formatCurrency(record.receiverFeeAmount)}
                  </span>
                </Row>
              </>
            )}
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
              <span className='text-muted-foreground'>
                {record.account?.glCode}
              </span>
            </span>
          </Row>
          <Row label='Tài khoản'>
            <span className='font-medium'>{ownerLabel}</span>
          </Row>
          <Row label='Số dư hiện tại'>
            <span className='font-bold tabular-nums'>
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
              {formatCurrency(record.account?.availableBalance)}
            </span>
          </Row>
          <Row label='Trạng thái tài khoản'>
            <StatusBadge
              className='text-xs'
              status={record.account?.status as StatusConstants}
            />
          </Row>
        </Panel>

        <Panel title='Chi tiết bút toán'>
          <Row label='Chiều'>
            <span className='font-bold'>
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
            <span className='font-bold tabular-nums'>
              {formatCurrency(record.balanceAfter)}
            </span>
          </Row>
          <Row label='Số dư bị giữ hiện tại'>
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
            <span className='font-medium'>{record.journalCode || '--'}</span>
          </Row>
        </Panel>
      </div>
    </div>
  )
}
