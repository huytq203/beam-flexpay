import { TimeFormat } from "@constants/datetime"
import { useGetInternalWalletTransactionsQuery } from "@services/apiInternalWallet"
import { viewMode } from "@type/customer"
import { InternalWallet, InternalWalletTransactionPayload } from "@type/internalWallet"
import { Card, Table } from "antd"
import moment from "moment"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type props = {
  title: string
  record?: any | undefined
  isShow: boolean
  onCancel: VoidFunction
  mode: viewMode
  selectedInternalWallet?: InternalWallet
}


function InternalWalletTransaction(props: props) {
  const [search, setSearch] = useState<InternalWalletTransactionPayload>({
    order: 'DESC',
    page: 1,
    take: 10,
    query: '',
    orderBy: 'createdAt'
  })

  const { t } = useTranslation()

  useEffect(() => {
    setSearch({
      ...search,
      internalWalletId: props.selectedInternalWallet?.id
    })
  }, [props.selectedInternalWallet])

  const { data: transactionData, refetch } = useGetInternalWalletTransactionsQuery(search)

  const columns: ColumnsType<any> = [
    {
      title: t('internal-wallet.transaction.date'),
      dataIndex: 'transactionDate',
      key: 'transactionDate'
    },
    {
      title: t('internal-wallet.transaction.type'),
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: t('internal-wallet.transaction.amount'),
      dataIndex: 'amount',
      key: 'amount'
    },
    {
      title: t('internal-wallet.transaction.note'),
      dataIndex: 'note',
      key: 'note'
    },
    {
      title: t('internal-wallet.transaction.code'),
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: t('internal-wallet.transaction.debitCreditAccount'),
      dataIndex: 'debitCreditAccount',
      key: 'debitCreditAccount'
    },
    {
      title: t('internal-wallet.transaction.afterBalance'),
      dataIndex: 'afterBalance',
      key: 'afterBalance'
    },
  ]

  return (
    <Card>
      <Table
        columns={columns}
        dataSource={transactionData?.data ?? []}
        rowKey='id'
        size='middle'
        bordered
        pagination={{
          current: transactionData?.meta.page,
          pageSize: transactionData?.meta.take,
          total: transactionData?.meta.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
    </Card>
  )
}

export default InternalWalletTransaction