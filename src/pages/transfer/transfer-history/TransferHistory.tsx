import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import TransactionTable from '@components/transaction-table/TransactionTable'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { TransactionFindAllApiArg } from '@type/application'
import { TransactionStatus, TransactionType } from '@type/transfer'
import { Card, Col, DatePicker, Form, Input, Row, Select } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

function TransferHistory() {
  const { t } = useTranslation()

  const [search, setSearch] = useState<TransactionFindAllApiArg>({
    page: 1,
    take: 10,
    orderBy: 'createdAt',
    order: 'DESC'
  })

  const [searchForm] = Form.useForm<TransactionFindAllApiArg>()

  const handleSearch = (values: any) => {
    const record: TransactionFindAllApiArg = {
      ...values,
      from: values?.from
        ? dayjs(values?.from).startOf('day').toISOString()
        : undefined,
      to: values?.to ? dayjs(values?.to).endOf('day').toISOString() : undefined,
      status: values?.status === '' ? undefined : values?.status,
      type: values?.type === '' ? undefined : values?.type,
      accountNumber:
        values?.accountNumber === '' || values?.accountNumber === undefined
          ? undefined
          : values?.accountNumber?.trim(),
      code:
        values?.code === '' || values?.code === undefined
          ? undefined
          : values?.code?.trim(),
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
    searchForm.setFieldValue(field, value.trim())
  }

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              form={searchForm}
              className='w-100'
              layout='vertical'
              onFinish={handleSearch}
              initialValues={{
                status: '',
                type: ''
              }}
            >
              <Row gutter={GUTTER}>
                <Col flex='auto'>
                  <Form.Item
                    label={t('transfer-history.transferNumber')}
                    name='code'
                  >
                    <Input
                      allowClear
                      className='w-100'
                      placeholder={t`transfer-history.placeholders.code`.toString()}
                      onBlur={(e) => onBlur('code', e.target.value)}
                      onChange={(event) => {
                        if (
                          event.target.value === '' ||
                          event.target.value === undefined
                        ) {
                          refreshData('code', event.target.value)
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col flex='auto'>
                  <Form.Item
                    label={t('transfer-history.accountName')}
                    name='accountNumber'
                  >
                    <Input
                      allowClear
                      placeholder={t`transfer-history.placeholders.account`.toString()}
                      onBlur={(e) => onBlur('accountNumber', e.target.value)}
                      onChange={(event) => {
                        if (
                          event.target.value === '' ||
                          event.target.value === undefined
                        ) {
                          refreshData('accountNumber', event.target.value)
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col flex='140px'>
                  <Form.Item
                    label={t('transfer-history.from')}
                    name='from'
                  >
                    <DatePicker
                      allowClear
                      format={TimeFormat}
                      className='w-100'
                      placeholder={t`transfer-history.placeholders.from`.toString()}
                      disabledDate={(current) =>
                        current > dayjs() ||
                        current >=
                          dayjs(searchForm.getFieldValue('to'), 'YYYY-MM-DD')
                      }
                      onChange={(event) => {
                        if (!event) {
                          refreshData('from', undefined)
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col flex='140px'>
                  <Form.Item
                    label={t('transfer-history.to')}
                    name='to'
                  >
                    <DatePicker
                      allowClear
                      className='w-100'
                      format={TimeFormat}
                      disabledDate={(current) =>
                        current > dayjs() ||
                        current <
                          dayjs(searchForm.getFieldValue('from'), 'YYYY-MM-DD')
                      }
                      placeholder={t`transfer-history.placeholders.to`.toString()}
                      onChange={(event) => {
                        if (!event) {
                          refreshData('to', undefined)
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col flex='220px'>
                  <Form.Item
                    label={t('transfer-history.transferType')}
                    name='type'
                  >
                    <Select
                      placeholder={t`transfer-history.placeholders.type`.toString()}
                      options={[
                        {
                          label: t('transfer-history.choice.all'),
                          value: ''
                        },
                        {
                          label: t('transfer-history.types.deposit'),
                          value: TransactionType.DEPOSIT
                        },
                        {
                          label: t('transfer-history.types.transfer'),
                          value: TransactionType.TRANSFER
                        },
                        {
                          label: t('transfer-history.types.payment'),
                          value: TransactionType.PAYMENT
                        },
                        {
                          label: t('transfer-history.types.withdraw'),
                          value: TransactionType.WITHDRAW
                        },
                        {
                          label: t('transfer-history.types.receive'),
                          value: TransactionType.RECEIVAL
                        }
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col flex='220px'>
                  <Form.Item
                    label={t('transfer-history.status')}
                    name='status'
                  >
                    <Select
                      options={[
                        {
                          label: t('transfer-history.choice.all'),
                          value: ''
                        },
                        {
                          label: t('transfer-history.choice.success'),
                          value: TransactionStatus.SUCCESS
                        },
                        {
                          label: t('transfer-history.choice.inprogress'),
                          value: TransactionStatus.PENDING
                        },
                        {
                          label: t('transfer-history.choice.approved'),
                          value: TransactionStatus.APPROVED
                        },
                        {
                          label: t('transfer-history.choice.reject'),
                          value: TransactionStatus.FAILURE
                        }
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row
                justify='end'
                gutter={GUTTER}
              >
                <Col>
                  <ButtonSearch htmlType='submit' />
                </Col>
              </Row>
            </Form>
          }
        />
      }
    >
      <TransactionTable
        search={search}
        setSearch={setSearch}
      />
    </Card>
  )
}

export default TransferHistory
