import { Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const DetailRechargeTable = () => {
  const { t } = useTranslation()

  const trans = useCallback((key: string) => {
    return t(`internal-detail-recharge-report.${key}`)
  }, [])
  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        title: trans('transactionCode'),
        align: 'center',
        render: () => '123456'
      },
      {
        title: trans('account'),
        align: 'center',
        render: () => '090*****023'
      },
      {
        title: trans('transactionValue'),
        align: 'center',
        render: () => '1.000.000'
      },
      {
        title: trans('fee'),
        align: 'center',
        render: () => '20.000'
      },
      {
        title: trans('bankFee'),
        align: 'center',
        render: () => '20.000'
      },
      {
        title: trans('money'),
        align: 'center',
        render: () => '20.200'
      },
      {
        title: trans('rechargeMethod'),
        align: 'center',
        render: () => 'Ngân hàng liên kết'
      },
      {
        title: trans('bank'),
        align: 'center',
        render: () => 'BIDV'
      },
      {
        title: trans('startTime'),
        align: 'center',
        render: () => '12/01/2022 12:30'
      },
      {
        title: trans('endTime'),
        align: 'center',
        render: () => '12/01/2022 12:30'
      }
    ],
    []
  )

  return (
    <Table
      columns={columns}
      bordered
      dataSource={[1, 2, 3, 4]}
      scroll={{ x: '100%' }}
    />
  )
}

export default React.memo(DetailRechargeTable)
