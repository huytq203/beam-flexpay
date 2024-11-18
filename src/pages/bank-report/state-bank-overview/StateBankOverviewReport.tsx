import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonView from '@components/button-view/ButtonView'
import CellContent from '@components/cell-content/CellContent'
import NoDataText from '@components/no-data-text/NoDataText'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat, TimeFullFormat } from '@constants/datetime'
import { accountStatusOptions, reportType } from '@constants/options'
import { BankSelection } from '@pages/system-management/bank-management/bank-selection/BankSelection'
import { useReportGetStateBankOverviewQuery } from '@services/cmsReport'
import { useLazyExportExcelQuery } from '@services/customerService'
import {
  BankCmsFindAllApiArg,
  ReportGetStateBankOverviewApiArg
} from '@type/application'
import { CustomerTableReport } from '@type/report'
import {
  convertNumber,
  getStatusAccountText,
  getTagAccountStatusColor
} from '@utils/helperFunctions'
import {
  Button,
  Card,
  Col,
  DatePicker,
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
import AccountDetailReportModal from './account-detail-modal/AccountDetailModal'

function StateBankOverviewReport() {
  const { t } = useTranslation()
  const [form] = Form.useForm<ReportGetStateBankOverviewApiArg>()

  const [open, setOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [search, setSearch] = useState<ReportGetStateBankOverviewApiArg>({
    page: 1,
    take: 10
  })
  const [searchLinkBank, setSearchLinkBank] = useState<BankCmsFindAllApiArg>({
    page: 1,
    take: 10,
    type: 'LINK'
  })
  const { data: accounts } = useReportGetStateBankOverviewQuery(search)

  const [exportFile] = useLazyExportExcelQuery()

  const toggleModal = (value: boolean) => {
    setOpen(value)
  }

  const accountList = useMemo(() => {
    if (accounts?.data && accounts.data.length > 0) {
      const data = accounts?.data?.map(
        (item: CustomerTableReport, index: number) => ({
          no: ((search?.page ?? 1) - 1) * 10 + index + 1,
          ...item
        })
      )
      return data
    } else return []
  }, [accounts?.data, search?.page])

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
      title: t`state-bank-overview.number-wallet`,
      render: (record) => {
        return <CellContent data={record} />
      }
    },
    {
      width: 150,
      align: 'center',
      dataIndex: 'fullName',
      title: t`state-bank-overview.customer`,
      render: (record) => {
        return <CellContent data={record} />
      }
    },
    {
      width: 150,
      align: 'center',
      dataIndex: 'identityNumber',
      title: t`state-bank-overview.cmnd-passport`,
      render: (record) => <CellContent data={record} />
    },
    {
      width: 150,
      align: 'center',
      dataIndex: 'openingBalance',
      title: t`state-bank-overview.opening-balance`,
      render: (record) => <div>{convertNumber(record)}</div>
    },
    {
      align: 'center',
      dataIndex: 'closingBalance',
      width: 150,
      title: t`state-bank-overview.closing-balance`,
      render: (record) => <div>{convertNumber(record)}</div>
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
      dataIndex: 'linkBank',
      title: t`state-bank-overview.link-bank`,
      render: (record) => {
        return <CellContent data={record} />
      }
    },
    {
      width: 150,
      align: 'center',
      dataIndex: 'updatedAt',
      title: t`internal-account-report.registration-time`,
      render: (record) => {
        return record ? dayjs(record).format(TimeFullFormat) : <NoDataText />
      }
    },
    {
      width: 100,
      align: 'center',
      dataIndex: '',
      title: t`internal-account-report.action`,
      render: (record: any) => (
        <ButtonView
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
              form={form}
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
                    name='name'
                    label={t`state-bank-overview.name`}
                  >
                    <Input
                      allowClear={true}
                      placeholder={t`state-bank-overview.placeholders.name`.toString()}
                      onChange={(e) => {
                        if (
                          e.target.value === '' ||
                          e.target.value === undefined
                        ) {
                          onClearSearch('name')
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
                    name='email'
                    label={t`state-bank-overview.email`}
                  >
                    <Input
                      allowClear={true}
                      placeholder={t`state-bank-overview.placeholders.email`.toString()}
                      onChange={(e) => {
                        if (
                          e.target.value === '' ||
                          e.target.value === undefined
                        ) {
                          onClearSearch('email')
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
                    name='phone'
                    label={t`state-bank-overview.number-wallet`}
                  >
                    <Input
                      allowClear={true}
                      placeholder={t`state-bank-overview.placeholders.number-wallet`.toString()}
                      onChange={(e) => {
                        if (
                          e.target.value === '' ||
                          e.target.value === undefined
                        ) {
                          onClearSearch('phone')
                        }
                      }}
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
                  md={12}
                  xl={6}
                >
                  <Form.Item
                    name='type'
                    label={t`state-bank-overview.report-type`}
                  >
                    <Select
                      placeholder={t`state-bank-overview.placeholders.report-type`.toString()}
                      allowClear
                      onClear={() => onClearSearch('type')}
                      options={reportType}
                    />
                  </Form.Item>
                </Col>
                <Col
                  xs={24}
                  md={8}
                  xl={6}
                >
                  <Form.Item
                    name='linkBank'
                    label={t`state-bank-overview.link-bank`}
                  >
                    <BankSelection
                      placeholder={t`state-bank-overview.placeholders.link-bank`.toString()}
                      onClear={() => {
                        setSearchLinkBank({
                          ...searchLinkBank,
                          page: 1,
                          name: undefined
                        })
                      }}
                      type={'LINK'}
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
                  md={8}
                  xl={24}
                  className='d-flex justify-end'
                >
                  <Button
                    className='mr-10'
                    type='primary'
                    ghost
                    onClick={exportFileCSV}
                  >{t`buttons.exportFile`}</Button>
                  <ButtonSearch htmlType='submit'>
                    {t`buttons.search`}
                  </ButtonSearch>
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
        rowKey='no'
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
        <AccountDetailReportModal
          account={selectedAccount}
          open={open}
          onCancel={() => toggleModal(false)}
        />
      )}
    </Card>
  )
}
export default StateBankOverviewReport
