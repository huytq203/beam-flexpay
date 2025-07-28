import ButtonExcel from '@components/button-excel/ButtonExcel'
import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import { TimeFormat } from '@constants/datetime'
import { useDashboardSendSmsQuery } from '@services/cmsDashboard'
import { DashboardSendSmsApiArg } from '@type/application'
import { Card, DatePicker, Empty, Form, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const SmsMetrics = () => {
  const [form] = Form.useForm<DashboardSendSmsApiArg>()
  const { t } = useTranslation()
  const [search, setSearch] = useState<DashboardSendSmsApiArg>({
    page: 1,
    take: 10,
    from: dayjs().startOf('month').toISOString(),
    to: dayjs().endOf('month').toISOString()
  })

  const { data: metrics } = useDashboardSendSmsQuery(search)

  //#region columns
  const columns: ColumnsType<any> = [
    {
      title: t('sms.index'),
      width: 100,
      align: 'center',
      render: (text, record, index) => index + 1
    },
    {
      title: t('sms.date'),
      dataIndex: 'date',
      align: 'center'
    },
    {
      title: t('sms.total'),
      dataIndex: 'total'
    }
  ]
  //#endregion

  const handleExcel = () => {}

  const handleSearch = (values: DashboardSendSmsApiArg) => {
    setSearch({
      ...search,
      from: dayjs(values.from).toISOString(),
      to: dayjs(values.to).toISOString()
    })
  }

  return (
    <Card
      title={
        <SearchBar
          cols='2'
          form={form}
          onFinish={handleSearch}
          initialValues={{
            from: dayjs().startOf('month'),
            to: dayjs().endOf('month')
          }}
          headerMenu={
            <>
              <Form.Item
                name='from'
                label={t('sms.startDate')}
              >
                <DatePicker
                  format={TimeFormat}
                  allowClear
                  className='w-full'
                  placeholder={t('sms.startDate').toString()}
                />
              </Form.Item>

              <Form.Item
                name='to'
                label={t('sms.endDate')}
              >
                <DatePicker
                  format={TimeFormat}
                  allowClear
                  className='w-full'
                  placeholder={t('sms.startDate').toString()}
                />
              </Form.Item>

              <ButtonExcel
                module='sms_stat'
                onClick={handleExcel}
              />

              <ButtonSearch htmlType='submit' />
            </>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={metrics?.data}
        scroll={{ x: '100%' }}
        size='small'
        bordered
        locale={{
          emptyText: (
            <>
              <Empty description={t`labels.nodata`} />
            </>
          )
        }}
        pagination={{
          current: metrics?.meta.page,
          pageSize: metrics?.meta.take,
          total: metrics?.meta.itemCount,
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
export default SmsMetrics
