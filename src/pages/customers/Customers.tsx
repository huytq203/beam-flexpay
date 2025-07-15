import ButtonExcel from '@components/button-excel/ButtonExcel'
import ButtonFreeze from '@components/button-freeze/ButtonFreeze'
import ButtonLock from '@components/button-lock/ButtonLock'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonUnlock from '@components/button-unlock/ButtonUnlock'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { useCustomerFindAllQuery } from '@services/cmsService'
import { useExportExcelQuery } from '@services/customerService'
import { CustomerFindAllApiArg } from '@type/application'
import { CustomerTable, accountStatus, viewMode } from '@type/customer'
import {
  getGender,
  getStatusAccountText,
  getStatusText,
  getTagAccountStatusColor,
  getTagColor,
  toPromise
} from '@utils/helperFunctions'
import { useBoolean } from 'ahooks'
import {
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import type { ColumnsType } from 'antd/lib/table'
import { t } from 'i18next'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CustomerModal from './customer-modal/CustomerModal'

import ButtonView from '@components/button-view/ButtonView'
import './style.scss'

const { Text } = Typography

function Customers() {
  const { t: trans } = useTranslation()
  const [mode, setMode] = useState<viewMode>(viewMode.lock)
  const [visible, { toggle }] = useBoolean(false)
  const [selected, setSelected] = useState<string>('')
  const [skip, setSkip] = useState(true)
  const [form] = Form.useForm()
  const [search, setSearch] = useState<CustomerFindAllApiArg>({
    page: 1,
    take: 10
  })

  const { data: accounts, refetch } = useCustomerFindAllQuery(search)

  const { isSuccess } = useExportExcelQuery(
    { pageCount: accounts?.meta.pageCount, ...search },
    { skip: skip, refetchOnMountOrArgChange: true }
  )

  useEffect(() => {
    if (isSuccess) {
      setSkip(true)
    }
  }, [isSuccess])

  // const setModal = () => toPromise(toggle())
  // const setModePromise = (mode: viewMode) => toPromise(setMode(mode))

  const handleModal = async (mode: viewMode, id?: string) => {
    // Gọi tất cả các hàm setState cùng lúc
    setMode(mode)
    if (id) {
      setSelected(id)
    } else {
      // Nếu không có id (ví dụ mode create), nên reset lại
      setSelected('')
    }
    toggle() // Hàm của useBoolean
  }

  const handleCancelModal = () => {
    toggle();
    // Có thể thêm một khoảng trễ nhỏ để người dùng không thấy ID bị xóa trước khi modal đóng hẳn
    setTimeout(() => {
      setSelected('');
    }, 200);
  }
  const accountList = useMemo(() => {
    if (accounts?.data && accounts.data.length > 0) {
      return accounts?.data?.map((item: CustomerTable, index: number) => ({
        no: ((search?.page ?? 1) - 1) * 10 + index + 1,
        ...item
      }))
    } else return []
  }, [accounts?.data])

  const Nodata = () => <Text>{trans`labels.nodata`}</Text>

  const CellContent = ({ content }: { content: string }) => (
    <Text>{content}</Text>
  )

  const accountColumns: ColumnsType<CustomerTable> = [
    {
      title: trans('labels.id'),
      dataIndex: 'no',
      key: 'id',
      align: 'center',
      fixed: 'left',
      width: 80
    },
    {
      title: trans('labels.accountOwner'),
      dataIndex: 'fullName',
      key: 'fullName',
      align: 'center',
      width: 120,
      fixed: 'left',
      render: (record) => {
        return record ? <CellContent content={record} /> : <Nodata />
      }
    },
    {
      title: trans('labels.email'),
      dataIndex: 'email',
      key: 'email',
      align: 'center',
      width: 250,
      ellipsis: true,
      render: (record) => {
        return record ? (
          <Tooltip title={record ? record : 'Chưa có dữ liệu'}>
            <CellContent content={record} />
          </Tooltip>
        ) : (
          <Nodata />
        )
      }
    },
    {
      title: trans('labels.phone'),
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      align: 'center',
      width: 100,
      render: (record) => {
        return record ? <CellContent content={record} /> : <Nodata />
      }
    },
    {
      title: trans('labels.gender'),
      dataIndex: 'gender',
      key: 'gender',
      align: 'center',
      width: 80,
      ellipsis: true,
      render: (record: string | number) => {
        return getGender(record)
      }
    },
    {
      title: trans('labels.IdNumber'),
      dataIndex: 'identityNumber',
      key: 'identityNumber',
      align: 'center',
      width: 140,
      render: (record) => {
        return record ? <CellContent content={record} /> : <Nodata />
      }
    },
    {
      title: trans('labels.status'),
      dataIndex: 'active',
      key: 'status',
      width: 100,
      align: 'center',
      render: (record: boolean) => (
        <Tag
          color={getTagColor(record)}
          className='text-capitalize'
        >
          {getStatusText(record)}
        </Tag>
      )
    },
    {
      title: trans('labels.accountStatus'),
      dataIndex: 'status',
      key: 'status',
      align: 'center',
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
      title: trans('labels.action'),
      dataIndex: 'active',
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 140,
      render: (value: string, record: CustomerTable) => (
        <Row
          gutter={GUTTER}
          justify='center'
        >
          <Col>
            <ButtonView
              onClick={async () => {
                console.log('View button clicked for record id:', record.id)
                return handleModal(viewMode.view, record.id)
              }}
            />
          </Col>

          <Col>
            <Tooltip
              title={
                record.active
                  ? t`internal-wallet.modal.change-status-lock-ok-button`
                  : t`internal-wallet.modal.change-status-unlock-ok-button`
              }
            >
              {record.active ? (
                <ButtonLock
                  module='customer'
                  onClick={async () =>
                    handleModal(viewMode.lock, record.id)
                  }
                />
              ) : (
                <ButtonUnlock
                  module='customer'
                  onClick={async () =>
                    handleModal(viewMode.unlock, record.id)
                  }
                />
              )}
            </Tooltip>
          </Col>
          <Col>
            <ButtonFreeze
              module='customer'
              onClick={async () =>
                 handleModal(viewMode.freeze, record.id)
              }
            />
          </Col>
        </Row>
      )
    }
  ]

  const exportData = () => {
    if (accounts?.meta.itemCount) {
      setSkip(false)
    }
  }

  const submit = (value: any) => {
    const newQuery = {
      ...search,
      ...value,
      active: value.active === '' ? undefined : value.active,
      status: value.status === '' ? undefined : value.status,
      page: 1
    }
    setSearch(newQuery)
  }

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              layout='vertical'
              onFinish={submit}
              form={form}
            >
              <Row gutter={GUTTER}>
                <Col flex='auto'>
                  <Form.Item
                    name='email'
                    label={trans('labels.email')}
                  >
                    <Input
                      placeholder={trans('placeholders.email').toString()}
                    />
                  </Form.Item>
                </Col>
                <Col flex='auto'>
                  <Form.Item
                    name='phoneNumber'
                    label={trans('labels.phone')}
                  >
                    <Input
                      placeholder={trans('placeholders.phone').toString()}
                    />
                  </Form.Item>
                </Col>
                <Col flex='auto'>
                  <Form.Item
                    name='name'
                    label={trans('labels.accountOwner')}
                  >
                    <Input
                      placeholder={trans('placeholders.owner').toString()}
                    />
                  </Form.Item>
                </Col>
                <Col flex='230px'>
                  <Form.Item
                    name='active'
                    label={trans('labels.status')}
                  >
                    <Select
                      placeholder={trans('placeholders.status')}
                      options={[
                        {
                          value: '',
                          label: trans('labels.all')
                        },
                        {
                          value: true,
                          label: trans('labels.active')
                        },
                        {
                          value: false,
                          label: trans('labels.lock')
                        }
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col flex='230px'>
                  <Form.Item
                    name='status'
                    label={trans('labels.accountStatus')}
                  >
                    <Select
                      placeholder={trans('placeholders.accountStatus')}
                      options={[
                        {
                          value: '',
                          label: trans('labels.all')
                        },
                        {
                          label: trans('labels.verified'),
                          value: accountStatus.VERIFIED
                        },
                        {
                          label: trans('labels.notVerified'),
                          value: accountStatus.NOT_VERIFIED
                        },
                        {
                          label: trans('labels.linked'),
                          value: accountStatus.LINKED
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
                  <ButtonExcel
                    module='customer'
                    onClick={exportData}
                  />
                </Col>
                <Col>
                  <ButtonSearch htmlType='submit' />
                </Col>
              </Row>
            </Form>
          }
        />
      }
    >
      <Table
        columns={accountColumns}
        dataSource={accountList || []}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
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
      <CustomerModal
        mode={mode}
        visible={visible}
        onCancel={handleCancelModal}
        id={selected}
        refetch={refetch}
      />
    </Card>
  )
}

export default Customers
