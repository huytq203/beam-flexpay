import { Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const RechargeTable = () => {
  const { t } = useTranslation()

  const trans = useCallback((key: string) => {
    const str = `internal-aggregate-recharge-report.${key}`
    return t(str)
  }, [])
  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        title: trans('time'),
        align: 'center',
        render: () => '12/01/2022'
      },
      {
        title: trans('transactionDay'),
        align: 'center',
        children: [
          {
            title: trans('value'),
            align: 'center',
            render: () => '24.000.000'
          },
          {
            align: 'center',
            title: trans('transactionAmount'),
            render: () => '234'
          }
        ]
      },
      {
        title: trans('method'),
        align: 'center',
        children: [
          {
            title: trans('methodName'),
            align: 'center',
            render: () => 'Nạp từ ngân hàng liên kết'
          },
          {
            title: trans('value'),
            align: 'center',
            render: () => '14.000.000'
          }
        ]
      },
      {
        title: trans('rechargeBank'),
        align: 'center',
        children: [
          {
            title: trans('bankName'),
            align: 'center',
            render: () => 'Vietcombank'
          },
          {
            title: trans('value'),
            align: 'center',
            render: () => '14.000.000'
          },
          {
            title: trans('systemFee'),
            align: 'center',
            render: () => '0'
          },
          {
            title: trans('bankFee'),
            align: 'center',
            render: () => '1.000.000'
          },
          {
            title: trans('transactionValue'),
            align: 'center',
            render: () => '1.000.000'
          }
        ]
      }
    ],
    []
  )

  return (
    <Table
      bordered
      style={{ marginTop: 16 }}
      columns={columns}
      dataSource={[1, 2, 3, 4, 5]}
      scroll={{ x: '100%' }}
    />
  )
}

export default React.memo(RechargeTable)
