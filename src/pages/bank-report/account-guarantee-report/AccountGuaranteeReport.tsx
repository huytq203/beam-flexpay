import SearchBar from '@components/search-bar/SearchBar'
import { TimeFormat } from '@constants/datetime'
import { ReportGetAccountGuaranteeApiArg } from '@type/application'
import { Button, Card, DatePicker, Form, Input } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AccountGuaranteeTable from './AccountGuaranteeTable'
import ButtonSearch from '@components/button-search/ButtonSearch'

function AccountGuaranteeReport() {
  const { t } = useTranslation()

  const [search, setSearch] = useState<ReportGetAccountGuaranteeApiArg>({
    page: 1,
    take: 10,
    orderBy: 'createdAt',
    order: 'DESC'
  })

  const [searchForm] = Form.useForm<ReportGetAccountGuaranteeApiArg>()

  const handleSearch = (values: any) => {
    const record: ReportGetAccountGuaranteeApiArg = {
      ...values,
      startDate: values?.startDate
        ? dayjs(values?.startDate).startOf('day').toISOString()
        : undefined,
      endDate: values?.endDate
        ? dayjs(values?.endDate).endOf('day').toISOString()
        : undefined,
      walletNumber:
        values?.walletNumber === '' || values?.walletNumber === undefined
          ? undefined
          : values?.walletNumber?.trim(),
      page: 1,
      take: 10
    }
    setSearch(record)
  }

  const refreshData = (field: string, value: string | undefined) => {
    if (value === '' || value === undefined || field === undefined) {
      setSearch({
        ...search,
        page: 1,
        [field]: undefined
      })
    }
  }

  const onBlur = (field: string, value: string) => {
    searchForm.setFieldValue(
      field as keyof ReportGetAccountGuaranteeApiArg,
      value.trim()
    )
  }

  return (
    <Card
      title={
        <SearchBar
          form={searchForm}
          onFinish={handleSearch}
          initialValues={{
            startDate: null,
            endDate: null,
            walletNumber: '',
            name: ''
          }}
          cols='2'
          headerMenu={
            <>
              <Form.Item
                label={t('account-guarantee.label.name')}
                name='name'
              >
                <Input
                  allowClear
                  className='w-100'
                  placeholder={t`account-guarantee.placeholders.name`.toString()}
                  onBlur={(e) => onBlur('name', e.target.value)}
                  onChange={(event) => {
                    if (
                      event.target.value === '' ||
                      event.target.value === undefined
                    ) {
                      refreshData('name', event.target.value)
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label={t('account-guarantee.label.number')}
                name='walletNumber'
              >
                <Input
                  allowClear
                  placeholder={t`account-guarantee.placeholders.number`.toString()}
                  onBlur={(e) => onBlur('walletNumber', e.target.value)}
                  onChange={(event) => {
                    if (
                      event.target.value === '' ||
                      event.target.value === undefined
                    ) {
                      refreshData('walletNumber', event.target.value)
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label={t('account-guarantee.label.from')}
                name='startDate'
              >
                <DatePicker
                  allowClear
                  format={TimeFormat}
                  className='w-100'
                  placeholder={t`account-guarantee.placeholders.from`.toString()}
                  disabledDate={(current) =>
                    current > dayjs() ||
                    current >=
                      dayjs(searchForm.getFieldValue('endDate'), 'YYYY-MM-DD')
                  }
                  onChange={(event) => {
                    if (!event) {
                      refreshData('startDate', undefined)
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label={t('account-guarantee.label.to')}
                name='endDate'
              >
                <DatePicker
                  allowClear
                  className='w-100'
                  format={TimeFormat}
                  disabledDate={(current) =>
                    current > dayjs() ||
                    current <
                      dayjs(searchForm.getFieldValue('startDate'), 'YYYY-MM-DD')
                  }
                  placeholder={t`account-guarantee.placeholders.to`.toString()}
                  onChange={(event) => {
                    if (!event) {
                      refreshData('endDate', undefined)
                    }
                  }}
                />
              </Form.Item>
              <ButtonSearch htmlType='submit' />

              <Button
                className='mr-10'
                type='primary'
                ghost
                // onClick={exportFileCSV}
              >{t`buttons.exportFile`}</Button>
            </>
          }
        />
      }
    >
      <AccountGuaranteeTable
        search={search}
        setSearch={setSearch}
      />
    </Card>
  )
}

export default AccountGuaranteeReport
