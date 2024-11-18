import ButtonView from '@components/button-view/ButtonView'
import CellContent from '@components/cell-content/CellContent'
import Table from '@components/table/Table'
import TransactionDetail from '@components/transaction-detail/TransactionDetail'
import { TimeFullFormat } from '@constants/datetime'
import { useReportGetAccountGuaranteeQuery } from '@services/cmsReport'
import { ReportGetAccountGuaranteeApiArg, TransactionDto } from '@type/application'
import {
  convertNumber,
  getTransactionType
} from '@utils/helperFunctions'
import { useBoolean } from 'ahooks'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type props = {
  search: ReportGetAccountGuaranteeApiArg
  setSearch: (search: ReportGetAccountGuaranteeApiArg) => void
  skip?: boolean
  className?: string
}

const TransactionManagementTable = ({ search, setSearch, skip, className }: props) => {
  const { t } = useTranslation()

  const [selectedId, setSelectedId] = useState<number>()
  const [visible, { setTrue, setFalse }] = useBoolean()

  const handleDetail = (id: number) => {
    setSelectedId(id)
    setTrue()
  }

  const transferHistoryColumns: ColumnsType<TransactionDto> = [
    {
      title: t('transaction-management-report.table.date'),
      dataIndex: 'createdAt',
      align: 'center',
      render: (value) => dayjs(value).format(TimeFullFormat),
      width: 160
    },
    {
      title: t('transaction-management-report.table.type'),
      dataIndex: 'type',
      align: 'center',
      render: (value) => getTransactionType(value),
      width: 120
    },
    {
      title: t('transaction-management-report.table.number'),
      dataIndex: 'number',
      width: 60,
      align: 'center',
      render: (value) => convertNumber(value),
    },
    {
      title: t('transaction-management-report.table.total'),
      dataIndex: 'totalTransaction',
      width: 60,
      align: 'center',
      render: (value) => convertNumber(value),
    },
    {
      title: t('account-guarantee.table.action'),
      dataIndex: 'id',
      align: 'center',
      fixed: 'right',
      width: 100,
      render: (value) => <ButtonView onClick={() => handleDetail(value)} />
    }
  ]

  const { data: dataAccountGuarantee } = useReportGetAccountGuaranteeQuery(search, {
    skip: skip
  })

  return (
    <>
      <Table
        columns={transferHistoryColumns}
        dataSource={dataAccountGuarantee?.data}
        className={className}
        pagination={{
          current: dataAccountGuarantee?.meta?.page,
          pageSize: 10,
          total: dataAccountGuarantee?.meta?.itemCount,
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
export default TransactionManagementTable