import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFullFormat } from '@constants/datetime'
import {
    useGetHistoryFreezeQuery
} from '@services/apiFreezeAndUnfreezeAccountService'
import {
    CustomerElementType,
    FreezeAndUnfreezeAccountSearchParams,
    HistoryElementType
} from '@type/freezeAccount'
import { convertNumber, removeNullUndefinedFields } from '@utils/helperFunctions'
import {
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    Row,
    Select,
    Table
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type CustomerInfo = {
  phoneNumber: string
}
interface HistoryFilterForm {
  id?: string
  transactionId?: string
  startDate?: Date // Nên dùng DatePicker thay vì Input
  endDate?: Date // Nên dùng DatePicker thay vì Input
  status?: boolean | ''
}
const CustomerFreezeBalanceHistoryTab = (props: CustomerInfo) => {
  const { phoneNumber } = props
  const { t: trans } = useTranslation()
  const [form] = Form.useForm()

  const [search, setSearch] = useState<FreezeAndUnfreezeAccountSearchParams>({
    page: 1,
    take: 10,
    customerAccountNumber: phoneNumber
  })

  // 4. Đồng bộ state `search` với prop `phoneNumber`
  useEffect(() => {
    if (phoneNumber) {
      setSearch((prev) => ({
        ...prev,
        customerAccountNumber: phoneNumber,
        page: 1
      }))
      form.resetFields() // Reset form khi đổi khách hàng
    }
  }, [phoneNumber, form])

  const { data: historyFreeze, isLoading: loadingHistory } =
    useGetHistoryFreezeQuery(search, {
      skip: !phoneNumber // Không gọi API nếu không có phoneNumber
    })

  // 5. Implement hàm submit cho form
  const onFinish = (values: HistoryFilterForm) => {
    console.log(values)
    
    // Convert empty string to undefined for status
    let formattedValues: Partial<FreezeAndUnfreezeAccountSearchParams> = {
      ...values,
      status: values.status === '' ? undefined : values.status
    }
    let searchNew = {
      ...search,
      ...formattedValues,
      page: 1 // Reset về trang 1 khi tìm kiếm
    }

    const cleanedSearchData = removeNullUndefinedFields(searchNew)
    setSearch(cleanedSearchData)
  }

  const historyTableColumns: ColumnsType<HistoryElementType> = [
    {
      title: trans('freezeAndUnfreezeAccount.number'),
      render: (text, object, index) => (
        <div>
          {((historyFreeze?.meta?.page as number) - 1) * 10 + index + 1}
        </div>
      ),
      align: 'center',
      key: 'id',
      width: 50,
      fixed: 'left'
    },
    {
      title: trans('freezeAndUnfreezeAccount.accountNumber'),
      dataIndex: 'customer',
      align: 'center',
      width: 200,
      key: 'accountNumber',
      render: (record: CustomerElementType) => (
        <div>{record?.accountNumber}</div>
      )
    },
    {
      title: trans('freezeAndUnfreezeAccount.freezeBalance'),
      align: 'center',
      width: 200,
      render: (record: CustomerElementType) => (
        <div>{convertNumber(record?.freezeMoney)} VND</div>
      )
    },
    {
      title: trans('freezeAndUnfreezeAccount.reason'),
      dataIndex: 'reason',
      align: 'center',
      key: 'reason',
      width: 400
    },
    {
      title: trans('freezeAndUnfreezeAccount.freezeBy'),
      dataIndex: 'user',
      align: 'center',
      key: 'fullName',
      width: 300,
      render: (record: CustomerElementType) => <div>{record?.fullName}</div>
    },
    {
      title: trans('freezeAndUnfreezeAccount.freezeAt'),
      key: 'createdAt',
      dataIndex: 'createdAt',
      align: 'center',
      fixed: 'right',
      width: 250,
      render: (value: string) => (
        <div>{dayjs(value).format(TimeFullFormat)}</div>
      )
    }
  ]
  return (
    <>
      <SearchBar
        headerMenu={
          <Form
            layout='vertical'
            onFinish={onFinish}
            form={form}
          >
            <Row gutter={GUTTER}>
              <Col flex='auto'>
                <Form.Item
                  name='id'
                  label={trans('freezeAndUnfreezeAccount.label.id')}
                >
                  <Input
                    onChange={() => setSearch({ ...search, id: undefined })}
                    placeholder={trans(
                      'freezeAndUnfreezeAccount.placeholders.id'
                    ).toString()}
                  />
                </Form.Item>
              </Col>
              <Col flex='auto'>
                <Form.Item
                  name='transactionId'
                  label={trans('freezeAndUnfreezeAccount.label.transactionId')}
                >
                  <Input
                    onChange={() => setSearch({ ...search, transactionId: undefined })}
                    placeholder={trans(
                      'freezeAndUnfreezeAccount.placeholders.transactionId'
                    ).toString()}
                  />
                </Form.Item>
              </Col>
              <Col flex='auto'>
                <Form.Item
                  name='startDate'
                  label={trans('freezeAndUnfreezeAccount.label.startDate')}
                >
                  <DatePicker
                    className='w-100'
                    placeholder={trans(
                      'freezeAndUnfreezeAccount.placeholders.startDate'
                    ).toString()}
                  />
                </Form.Item>
              </Col>
              <Col flex='auto'>
                <Form.Item
                  name='endDate'
                  label={trans('freezeAndUnfreezeAccount.label.endDate')}
                >
                  <DatePicker
                    className='w-100'
                    placeholder={trans(
                      'freezeAndUnfreezeAccount.placeholders.endDate'
                    ).toString()}
                  />
                </Form.Item>
              </Col>
              <Col flex='180px'>
                <Form.Item
                  name='status'
                  label={trans('freezeAndUnfreezeAccount.label.status')}
                >
                  <Select
                    placeholder={trans(
                      'freezeAndUnfreezeAccount.placeholders.status'
                    )}
                    options={[
                      {
                        value: '',
                        label: trans('labels.all')
                      },
                      {
                        value: true,
                        label: trans('freezeAndUnfreezeAccount.label.freeze')
                      },
                      {
                        value: false,
                        label: trans('freezeAndUnfreezeAccount.label.unfreeze')
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
      <Row className='w-100'>
        <Card
          title={trans('freezeAndUnfreezeAccount.tableHistoryTitle')}
          className='w-100'
        >
          <Table
            columns={historyTableColumns}
            dataSource={historyFreeze?.data || []}
            loading={loadingHistory}
            scroll={{ x: '100%' }}
            bordered
            rowKey='id'
            size='small'
            pagination={{
              current: historyFreeze?.meta?.page,
              pageSize: historyFreeze?.meta?.take,
              total: historyFreeze?.meta?.itemCount,
              async onChange(page) {
                setSearch({
                  ...search,
                  page
                })
              }
            }}
          />
        </Card>
      </Row>
      {/* </Form><FreezeAccount/> */}
    </>
  )
}

export default CustomerFreezeBalanceHistoryTab
