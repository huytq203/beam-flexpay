import { Table } from '@components/index'
import { Table as AntTable } from 'antd'
import { SERVICE_TYPE_LABELS } from '@constants/feeLabels'
import { formatFeeNumber } from '@utils/fee-format'
import type {
  InputCostReportGroup,
  InputCostReportSummary
} from '@/app/schemas/fee-input-cost-report.schema'
import { marginCell, moneyCell, money } from './reportCells'

interface Props {
  summary: InputCostReportSummary | undefined
  loading: boolean
}

type Row = InputCostReportGroup & { key: string }

/** Tổng hợp theo NCC × ngân hàng × dịch vụ, kèm dòng tổng cộng. */
export const InputCostReportSummaryTable = ({ summary, loading }: Props) => {
  const rows: Row[] = (summary?.groups ?? []).map((g) => ({
    ...g,
    key: `${g.providerCode ?? ''}|${g.bankCode ?? ''}|${g.serviceType}`
  }))
  const totals = summary?.totals

  return (
    <Table
      size='small'
      rowKey='key'
      loading={loading}
      dataSource={rows}
      pagination={false}
      scroll={{ x: 'max-content' }}
      columns={[
        { title: 'NCC', dataIndex: 'providerCode', render: (v) => v ?? '—' },
        { title: 'Ngân hàng', dataIndex: 'bankCode', render: (v) => v ?? '—' },
        {
          title: 'Dịch vụ',
          dataIndex: 'serviceType',
          render: (v: string) => SERVICE_TYPE_LABELS[v] ?? v
        },
        {
          title: 'Số giao dịch',
          dataIndex: 'transactionCount',
          align: 'right',
          render: (v: number) => formatFeeNumber(v)
        },
        {
          title: 'Tổng số tiền',
          dataIndex: 'totalAmount',
          align: 'right',
          render: moneyCell
        },
        {
          title: 'Tổng phí thu khách',
          dataIndex: 'totalCustomerFee',
          align: 'right',
          render: moneyCell
        },
        {
          title: 'Tổng phí đầu vào',
          dataIndex: 'totalInputCost',
          align: 'right',
          render: moneyCell
        },
        {
          title: 'Chênh lệch',
          dataIndex: 'margin',
          align: 'right',
          render: marginCell
        }
      ]}
      summary={() =>
        totals ? (
          <AntTable.Summary.Row data-testid='summary-totals'>
            <AntTable.Summary.Cell
              index={0}
              colSpan={3}
            >
              <strong>Tổng cộng</strong>
            </AntTable.Summary.Cell>
            <AntTable.Summary.Cell
              index={1}
              align='right'
            >
              <strong>{formatFeeNumber(totals.transactionCount)}</strong>
            </AntTable.Summary.Cell>
            <AntTable.Summary.Cell
              index={2}
              align='right'
            >
              <strong>{money(totals.totalAmount)}</strong>
            </AntTable.Summary.Cell>
            <AntTable.Summary.Cell
              index={3}
              align='right'
            >
              <strong>{money(totals.totalCustomerFee)}</strong>
            </AntTable.Summary.Cell>
            <AntTable.Summary.Cell
              index={4}
              align='right'
            >
              <strong>{money(totals.totalInputCost)}</strong>
            </AntTable.Summary.Cell>
            <AntTable.Summary.Cell
              index={5}
              align='right'
            >
              <strong>{marginCell(totals.margin)}</strong>
            </AntTable.Summary.Cell>
          </AntTable.Summary.Row>
        ) : null
      }
    />
  )
}
