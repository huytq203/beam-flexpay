import CellContent from '@components/cell-content/CellContent'
import Table from '@components/table/Table'
import { TimeFullFormat } from '@constants/datetime'
import { TransactionStepDto } from '@type/application'
import { TransactionStatus } from '@type/transfer'
import {
  convertLocalStringNumber,
  getTransactionStatus,
  getTransactionSubType
} from '@utils/helperFunctions'
import { Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type TransactionStepProps = { transactionSteps: TransactionStepDto[] }

const TransactionStep = ({ transactionSteps }: TransactionStepProps) => {
  const { t } = useTranslation()

  const transactionStepColumns: ColumnsType<TransactionStepDto> = useMemo(() => [
    {
      title: t('transaction-step.number'),
      dataIndex: 'no',
      width: 60,
      align: 'center',
      render(value, record, index) {
        return index + 1
      },
      fixed: 'left'
    },
    {
      title: t('transaction-step.transferTime'),
      dataIndex: 'createdAt',
      align: 'center',
      render: (value) => dayjs(value).format(TimeFullFormat),
      fixed: 'left',
      width: 160
    },
    {
      title: t('transaction-step.sourceAccountNumber'),
      dataIndex: 'sourceAccountNumber',
      align: 'center',
      render: (value) => <CellContent data={value} />,
      fixed: 'left',
      width: 160
    },
    {
      title: t('transaction-step.destinationAccountNumber'),
      dataIndex: 'destinationAccountNumber',
      align: 'center',
      render: (value) => <CellContent data={value} />,
      fixed: 'left',
      width: 160
    },
    {
      title: t('transaction-step.transferType'),
      dataIndex: 'subType',
      align: 'center',
      render: (value) => getTransactionSubType(value),
      width: 120
    },
    {
      title: t('transaction-step.value') + ' (VNĐ)',
      dataIndex: 'amount',
      align: 'center',
      render: (value) => convertLocalStringNumber(value),
      width: 200
    },
    {
      title: t('transaction-step.status'),
      dataIndex: 'errorCode',
      align: 'center',
      render: (errorCode: string) => {
        let status = TransactionStatus.FAILED
        if (errorCode === null) status = TransactionStatus.INIT
        if (errorCode === 'TS_000') status = TransactionStatus.SUCCESS
        return (
          <Tag color={getTransactionStatus(status)?.value}>
            {getTransactionStatus(status)?.label}
          </Tag>
        )
      },
      width: 100
    }
  ], [t])

  return (
    <Table
      rowKey="id"
      columns={transactionStepColumns}
      dataSource={transactionSteps}
      pagination={false}
    />
  )
}

export default TransactionStep
