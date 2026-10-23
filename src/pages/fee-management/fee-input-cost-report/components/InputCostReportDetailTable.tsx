import { Table } from '@components/index'
import { SERVICE_TYPE_LABELS } from '@constants/feeLabels'
import type { FeePage } from '@type/fee.type'
import dayjs from 'dayjs'
import type { InputCostReportRow } from '@/app/schemas/fee-input-cost-report.schema'
import { money, marginCell, methodLabel, moneyCell } from './reportCells'

interface Props {
  data: FeePage<InputCostReportRow> | undefined
  loading: boolean
  page: number
  size: number
  onPageChange: (page: number, size: number) => void
  toolbar?: React.ReactNode
}

/** Chi tiết giao dịch; mở rộng dòng để xem từng thành phần phí đầu vào. */
export const InputCostReportDetailTable = ({
  data,
  loading,
  page,
  size,
  onPageChange,
  toolbar
}: Props) => (
  <Table
    size='small'
    rowKey='feeCalculationId'
    loading={loading}
    dataSource={data?.content ?? []}
    toolbar={toolbar}
    scroll={{ x: 'max-content' }}
    pagination={{
      current: page,
      pageSize: size,
      total: data?.totalElements ?? 0,
      showSizeChanger: true,
      onChange: onPageChange
    }}
    expandable={{
      rowExpandable: (row: InputCostReportRow) => row.components.length > 0,
      expandedRowRender: (row: InputCostReportRow) => (
        <ul className='m-0 list-disc pl-5'>
          {row.components.map((c, i) => (
            <li key={`${c.componentType}-${i}`}>
              {c.componentType}
              {c.beneficiaryType ? ` (${c.beneficiaryType})` : ''}:{' '}
              {money(c.calculatedFee)}
            </li>
          ))}
        </ul>
      )
    }}
    columns={[
      { title: 'Mã phí', dataIndex: 'feeCode', render: (v) => v ?? '—' },
      {
        title: 'Thời điểm',
        dataIndex: 'issuedAt',
        render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm:ss')
      },
      {
        title: 'Dịch vụ',
        dataIndex: 'serviceType',
        render: (v: string) => SERVICE_TYPE_LABELS[v] ?? v
      },
      { title: 'NCC', dataIndex: 'providerCode', render: (v) => v ?? '—' },
      { title: 'Ngân hàng', dataIndex: 'bankCode', render: (v) => v ?? '—' },
      {
        title: 'Phương thức',
        dataIndex: 'paymentMethod',
        render: (v?: string | null) => methodLabel(v)
      },
      {
        title: 'Số tiền giao dịch',
        dataIndex: 'transactionAmount',
        align: 'right',
        render: moneyCell
      },
      {
        title: 'Phí thu khách',
        dataIndex: 'customerFee',
        align: 'right',
        render: moneyCell
      },
      {
        title: 'Phí đầu vào',
        dataIndex: 'inputCost',
        align: 'right',
        render: moneyCell
      },
      {
        title: 'Chênh lệch',
        dataIndex: 'margin',
        align: 'right',
        render: marginCell
      },
      {
        title: 'Chính sách phí đầu vào',
        dataIndex: 'inputCostPolicyName',
        render: (v) => v ?? '—'
      }
    ]}
  />
)
