import type { TableProps } from 'antd'
import type { SignatureHistoryItem } from '@/app/services/merchantGatewayApi'
import { TagComponent } from '@components/index'
import { SIGNATURE_HISTORY_RESULT } from '../constants/credential.constants'
import { dateLabel } from '../utils/credential.utils'

type Columns = NonNullable<TableProps<SignatureHistoryItem>['columns']>

/** `page` tính từ 0 như API lịch sử chữ ký. */
export const createSignatureHistoryColumns = (
  page: number,
  size: number
): Columns => [
  {
    title: '#',
    align: 'center',
    width: 56,
    render: (_value, _record, index) => page * size + index + 1
  },
  {
    title: 'Thời điểm xác thực',
    width: 170,
    render: (_, record) => dateLabel(record.verifiedAt)
  },
  {
    title: 'Kết quả',
    width: 170,
    render: (_, record) => (
      <TagComponent
        color={record.verificationResult === 'VERIFIED' ? 'success' : 'error'}
      >
        {SIGNATURE_HISTORY_RESULT[record.verificationResult] ??
          record.verificationResult}
      </TagComponent>
    )
  },
  {
    title: 'Phiên bản khóa',
    width: 110,
    render: (_, record) => `v${record.credentialVersion} · ${record.authMode}`
  },
  {
    title: 'IP nguồn',
    width: 140,
    render: (_, record) => record.sourceIp ?? '—'
  },
  {
    title: 'Request ID',
    width: 180,
    render: (_, record) => (
      <span className='break-all font-mono text-xs'>
        {record.requestId ?? '—'}
      </span>
    )
  },
  {
    title: 'Timestamp request',
    width: 170,
    render: (_, record) => dateLabel(record.requestTimestamp, '—')
  }
]
