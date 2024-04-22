import ButtonView from '@components/button-view/ButtonView'
import CellContent from '@components/cell-content/CellContent'
import Table from '@components/table/Table'
import TransactionDetail from '@components/transaction-detail/TransactionDetail'
import { TimeFullFormat } from '@constants/datetime'
import { useTransactionFindAllQuery } from '@services/cmsService'
import { TransactionDto, TransactionFindAllApiArg } from '@type/application'
import {
  convertLocalStringNumber,
  getTransactionStatus,
  getTransactionType
} from '@utils/helperFunctions'
import { useBoolean } from 'ahooks'
import { Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type props = {
  search: TransactionFindAllApiArg
  setSearch: (search: TransactionFindAllApiArg) => void
  skip?: boolean
  className?: string
}

const TransactionTable = ({ search, setSearch, skip, className }: props) => {
  const { t } = useTranslation()

  const [selectedId, setSelectedId] = useState<number>()
  const [visible, { setTrue, setFalse }] = useBoolean()

  const handleDetail = (id: number) => {
    setSelectedId(id)
    setTrue()
  }

  const transferHistoryColumns: ColumnsType<TransactionDto> = [
    {
      title: t('transfer-history.number'),
      dataIndex: 'no',
      width: 60,
      align: 'center',
      render(value, record, index) {
        if (search.page === 1) {
          return index + search.page
        } else {
          return index + ((search.page - 1) * search.take + 1)
        }
      },
      fixed: 'left'
    },
    {
      title: t('transfer-history.transferTime'),
      dataIndex: 'createdAt',
      align: 'center',
      render: (value) => dayjs(value).format(TimeFullFormat),
      fixed: 'left',
      width: 160
    },
    {
      title: t('transfer-history.transferNumber'),
      dataIndex: ['referenceId'],
      align: 'center',
      render: (record) => <CellContent data={record} />,
      fixed: 'left',
      width: 160
    },
    {
      title: t('transfer-history.accountName'),
      dataIndex: 'from',
      align: 'center',
      render: (record) => <CellContent data={record} />,
      width: 150
    },
    {
      title: t('transfer-history.transferType'),
      dataIndex: 'type',
      align: 'center',
      render: (value) => getTransactionType(value),
      width: 120
    },
    {
      title: t('transfer-history.value') + ' (VNĐ)',
      dataIndex: 'amount',
      align: 'center',
      render: (value, amount) => convertLocalStringNumber(value),
      width: 200
    },
    {
      title: t('transfer-history.fee') + ' (VNĐ)',
      dataIndex: 'fee',
      align: 'center',
      render: (record) => (
        <CellContent data={convertLocalStringNumber(record)} />
      ),
      width: 200
    },
    {
      title: t('transfer-history.total') + ' (VNĐ)',
      dataIndex: 'amount',
      align: 'center',
      render: (value,record) => (
        <CellContent data={convertLocalStringNumber(value - record.fee)} />
      ),
      width: 200
    },
    {
      title: t('transfer-history.status'),
      dataIndex: 'status',
      align: 'center',
      render: (status: string) => (
        <Tag color={getTransactionStatus(status)?.value}>
          {getTransactionStatus(status)?.label}
        </Tag>
      ),
      width: 100
    },
    {
      title: t('transfer-history.note'),
      dataIndex: 'note',
      align: 'center',
      width: 300,
      ellipsis: true,
      render: (record) => <CellContent data={record} />
    },
    {
      title: t('transfer-history.action'),
      dataIndex: 'id',
      align: 'center',
      fixed: 'right',
      width: 100,
      render: (value) => <ButtonView onClick={() => handleDetail(value)} />
    }
  ]

  const { data: transactionHistory } = useTransactionFindAllQuery(search, {
    skip: skip
  })

  return (
    <>
      <Table
        columns={transferHistoryColumns}
        dataSource={transactionHistory?.data}
        className={className}
        pagination={{
          current: transactionHistory?.meta?.page,
          pageSize: 10,
          total: transactionHistory?.meta?.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      {selectedId && (
        <TransactionDetail
          open={visible}
          onCancel={setFalse}
          id={String(selectedId)}
        />
      )}
    </>
  )
}
export default TransactionTable