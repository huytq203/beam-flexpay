import CellContent from '@components/cell-content/CellContent'
import NoDataText from '@components/no-data-text/NoDataText'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat, TimeFullFormat } from '@constants/datetime'
import {
  accountStatusOptions,
  typeOptions,
  verifiedOptions
} from '@constants/options'
import {
  useGetCustomersQuery,
  useLazyExportExcelQuery
} from '@services/customerService'
import { CustomerSearchParams, CustomerTable } from '@type/customer'
import {
  getAccountType,
  getStatusAccountText,
  getTagAccountStatusColor,
  getVerifyTye
} from '@utils/helperFunctions'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Tag,
  notification
} from 'antd'
import Table, { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BsEyeFill } from 'react-icons/bs'
import AccountDetailModal from './account-detail-modal/AccountDetailModal'
import SearchBar from '@components/search-bar/SearchBar'
import { CustomerFindAllApiArg } from '@type/application'

function InternalAccountReport() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [search, setSearch] = useState<CustomerFindAllApiArg>({
    page: 1,
    take: 10
  })

  const { data: accounts } = useGetCustomersQuery(search)

  const [exportFile] = useLazyExportExcelQuery()

  const toggleModal = (value: boolean) => {
    setOpen(value)
  }

  const accountList = useMemo(() => {
    if (accounts?.data && accounts.data.length > 0) {
      return accounts?.data?.map((item: CustomerTable, index: number) => ({
        no: ((search?.page ?? 1) - 1) * 10 + index + 1,
        ...item
      }))
    } else return []
  }, [accounts?.data])

  const columns: ColumnsType<any> = [
    {
      width: 80,
      align: 'center',
      dataIndex: 'no',
      title: t`internal-account-report.no`
    },
    {
      width: 100,
      align: 'center',
      dataIndex: 'phoneNumber',
      title: t`internal-account-report.phone-number`,
      render: (record) => {
        return <CellContent data={record} />
      }
    },
    {
      width: 150,
      align: 'center',
      dataIndex: 'fullName',
      title: t`internal-account-report.name`,
      render: (record) => {
        return <CellContent data={record} />
      }
    },
    {
      width: 150,
      align: 'center',
      dataIndex: 'type',
      title: t`internal-account-report.account-type`,
      render: (record) => <CellContent data={getAccountType(record)} />
    },
    {
      align: 'center',
      dataIndex: 'status',
      title: t`internal-account-report.status`,
      width: 100,
      render: (record: string) => (
        <Tag
          color={getTagAccountStatusColor(record)}
          className='text-capitalize'
        >
          {getStatusAccountText(record)}
        </Tag>
      )
    },
    {
      width: 150,
      align: 'center',
      dataIndex: 'customerVerificationId',
      title: t`internal-account-report.verified-type`,
      render: (record) => <CellContent data={getVerifyTye(record)} />
    },
    {
      align: 'center',
      dataIndex: 'address',
      width: 150,
      title: t`internal-account-report.address`,
      render: (record) => {
        return <CellContent data={record} />
      }
    },
    {
      width: 150,
      align: 'center',
      dataIndex: 'device',
      title: t`internal-account-report.registration-device`,
      render: (record) => {
        return <CellContent data={record?.platformName} />
      }
    },
    {
      width: 150,
      align: 'center',
      dataIndex: 'createdAt',
      title: t`internal-account-report.registration-time`,
      render: (record) => {
        return record ? dayjs(record).format(TimeFullFormat) : <NoDataText />
      }
    },
    {
      width: 150,
      align: 'center',
      dataIndex: 'customerVerification',
      title: t`internal-account-report.verified-time`,
      render: (record) => {
        return record && record?.createdAt ? (
          dayjs(record.createdAt).format(TimeFullFormat)
        ) : (
          <NoDataText />
        )
      }
    },
    {
      width: 100,
      align: 'center',
      dataIndex: '',
      title: t`internal-account-report.action`,
      render: (record: any) => (
        <Button
          icon={<BsEyeFill />}
          onClick={() => {
            setSelectedAccount(record)
            toggleModal(true)
          }}
        />
      )
    }
  ]

  const submit = (value: any) => {
    const newQuery = {
      ...search,
      ...value,
      active: value.active === '' ? undefined : value.active,
      status: value.status === '' ? undefined : value.status,
      from: value.from
        ? dayjs(value.from).startOf('day').toISOString()
        : undefined,
      to: value.to ? dayjs(value.to).endOf('day').toISOString() : undefined,
      page: 1
    }
    setSearch(newQuery)
  }

  const onClearSearch = (field: string) => {
    const newSearch = {
      ...search,
      page: 1,
      [field]: undefined
    }
    setSearch(newSearch)
  }

  const exportFileCSV = async () => {
    try {
      const data = await exportFile({
        pageCount: accounts?.meta.pageCount,
        ...search
      })
      notification.destroy()
      notification.success({
        message: t`internal-account-report.export-success`.toString()
      })
    } catch (error) {
      notification.destroy()
      notification.error({
        message: t`internal-account-report.export-failed`.toString()
      })
      return
    }
  }

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              layout='vertical'
              onFinish={submit}
            >
              <Row gutter={GUTTER}>
                <Col
                  xs={24}
                  md={12}
                  xl={6}
                >
                  <Form.Item
                    name='phoneNumber'
                    label={t`internal-account-report.phone-number`}
                  >
                    <Input
                      allowClear={true}
                      placeholder={t`internal-account-report.placeholders.phone`.toString()}
                      onChange={(e) => {
                        if (
                          e.target.value === '' ||
                          e.target.value === undefined
                        ) {
                          onClearSearch('phoneNumber')
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col
                  xs={24}
                  md={12}
                  xl={6}
                >
                  <Form.Item
                    name='from'
                    label={t`internal-account-report.start-time`}
                  >
                    <DatePicker
                      format={TimeFormat}
                      allowClear
                      className='w-100'
                      placeholder={t`internal-account-report.placeholders.start-time`.toString()}
                      onChange={(e) => {
                        if (!e) {
                          onClearSearch('from')
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col
                  xs={24}
                  md={12}
                  xl={6}
                >
                  <Form.Item
                    name='to'
                    label={t`internal-account-report.end-time`}
                  >
                    <DatePicker
                      format={TimeFormat}
                      allowClear
                      className='w-100'
                      placeholder={t`internal-account-report.placeholders.end-time`.toString()}
                      onChange={(e) => {
                        if (!e) {
                          onClearSearch('to')
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col
                  xs={24}
                  md={12}
                  xl={6}
                >
                  <Form.Item
                    name='type'
                    label={t`internal-account-report.account-type`}
                  >
                    <Select
                      placeholder={t`internal-account-report.placeholders.account-type`.toString()}
                      allowClear
                      onClear={() => onClearSearch('type')}
                      options={typeOptions}
                    />
                  </Form.Item>
                </Col>
                <Col
                  xs={24}
                  md={8}
                  xl={6}
                >
                  <Form.Item
                    name='status'
                    label={t`internal-account-report.status`}
                  >
                    <Select
                      placeholder={t`internal-account-report.placeholders.status`.toString()}
                      options={accountStatusOptions}
                      allowClear
                      onClear={() => onClearSearch('status')}
                    />
                  </Form.Item>
                </Col>
                <Col
                  xs={24}
                  md={8}
                  xl={6}
                >
                  <Form.Item
                    name='confirmType'
                    label={t`internal-account-report.verified-type`}
                  >
                    <Select
                      placeholder={t`internal-account-report.placeholders.verified-type`.toString()}
                      options={verifiedOptions}
                      allowClear
                      onClear={() => onClearSearch('confirmType')}
                    />
                  </Form.Item>
                </Col>
                <Col
                  xs={24}
                  md={8}
                  xl={12}
                  className='d-flex justify-end mt-30'
                >
                  <Button
                    className='mr-10'
                    type='primary'
                    htmlType='submit'
                  >{t`buttons.search`}</Button>
                  <Button
                    type='primary'
                    ghost
                    onClick={exportFileCSV}
                  >{t`buttons.exportFile`}</Button>
                </Col>
              </Row>
            </Form>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={accountList || []}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        pagination={{
          current: accounts?.meta?.page,
          pageSize: accounts?.meta?.take,
          total: accounts?.meta?.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      {open && selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          open={open}
          onCancel={() => toggleModal(false)}
        />
      )}
    </Card>
  )
}
export default InternalAccountReport
