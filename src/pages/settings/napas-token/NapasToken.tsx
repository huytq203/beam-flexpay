import { SearchOutlined } from '@ant-design/icons'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { getAccessTokenCookie } from '@configs/fetchBaseQuery.types'
import { TimeFormat, TimeFullFormat } from '@constants/datetime'
import {
  usePaymentLinkCancelTokenMutation,
  usePaymentLinkFindAllQuery
} from '@services/cmsService'
import { PageMeta, ResponseType } from '@type/api'
import { PaymentLinkCmsDto, PaymentLinkFindAllApiArg } from '@type/application'
import { IBank } from '@type/napasToken'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  message
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { BaseSelectRef } from 'rc-select'
import { createRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const NapasToken = () => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [bankSearch, setBankSearch] = useState({
    page: 1,
    take: 10,
    bankName: ''
  })
  const [paginationInfo, setPaginationInfo] = useState<PageMeta>()
  const [banks, setBanks] = useState<IBank[]>([])
  const [form] = useForm<PaymentLinkFindAllApiArg>()
  const [search, setSearch] = useState<PaymentLinkFindAllApiArg>({
    page: 1,
    take: 10
  })

  const ref = createRef<BaseSelectRef>()

  const { data } = usePaymentLinkFindAllQuery(search)
  const [cancelNapasToken] = usePaymentLinkCancelTokenMutation()

  const confirmCancelToken = (tokenId: number) => {
    cancelNapasToken({ id: tokenId })
      .unwrap()
      .then(() => {
        message.success(t`napasToken.success-message`)
      })
  }

  const handleCancelToken = (record: PaymentLinkCmsDto) => {
    Modal.confirm({
      centered: true,
      title: t`napasToken.modal.confirm-title`,
      content: t`napasToken.modal.description`,
      okText: t`napasToken.modal.ok`,
      cancelText: t`napasToken.modal.cancel`,
      onOk: () => confirmCancelToken(record?.id)
    })
  }

  const handleSearch = (value: PaymentLinkFindAllApiArg) => {
    const data = {
      ...value,
      from: value.from ? dayjs(value.from).toISOString() : undefined,
      to: value.to ? dayjs(value.to).toISOString() : undefined,
      status: value?.status ? value.status : undefined,
      page: 1
    }
    setSearch(data)
  }

  const getStatus = (status: number) => {
    if (status)
      return { color: 'success', text: t`napasToken.statusCheck.success` }
    else return { color: 'error', text: t`napasToken.statusCheck.failed` }
  }

  const tableColumns: ColumnsType<PaymentLinkCmsDto> = [
    {
      title: t('napasToken.time'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (record) => dayjs(record).format(TimeFullFormat)
    },
    {
      title: t('napasToken.accountNumber'),
      dataIndex: ['customer', 'accountNumber'],
      align: 'center',
      key: 'cardNumber'
    },
    {
      title: t('napasToken.accountName'),
      dataIndex: ['payerName'],
      align: 'center',
      key: 'nameOnCard'
    },
    {
      title: t('napasToken.banks'),
      dataIndex: ['bank', 'name'],
      align: 'center',
      key: 'cardBrand'
    },
    {
      title: t('napasToken.status'),
      dataIndex: 'status',
      align: 'center',
      key: 'status',
      render: (record) => {
        const status = getStatus(record)
        return <Tag color={status.color}>{status.text}</Tag>
      }
    },
    {
      title: t('napasToken.actions'),
      dataIndex: 'status',
      align: 'center',
      key: 'actions',
      render: (value, record) => {
        if (value)
          return (
            <Button
              onClick={() => handleCancelToken(record)}
              size='small'
              type='primary'
              ghost
            >
              {t('napasToken.cancel')}
            </Button>
          )
        else return undefined
      }
    }
  ]

  /**
   * function that store and arrange data
   * @param data
   */
  const storeData = (data: { data: IBank[]; meta: PageMeta }) => {
    if (
      data.data &&
      data.data.length > 0 &&
      data.meta &&
      data.meta.page === 1
    ) {
      setBanks(data.data)
      setPaginationInfo(data.meta)
    } else {
      setBanks((pre) => pre.concat(data.data))
      setPaginationInfo(data.meta)
    }
    setLoading(false)
  }

  /**
   * fetch bank data
   * @param query
   */
  const fetchBanks = async (query: any) => {
    const endpoint =
      `${import.meta.env.VITE_API_URL}/bank?` + new URLSearchParams(query)
    const accessToken = getAccessTokenCookie()
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    const { data } = (await response.json()) as ResponseType<{
      data: IBank[]
      meta: any
    }>
    storeData(data)
  }

  /**
   * handle select option select
   * @param open
   */
  const handleOpenSelect = (open: boolean) => {
    if (open) {
      setVisible(true)
      if (banks.length == 0) {
        setLoading(true)
        fetchBanks(bankSearch)
      }
    } else {
      ref.current?.scrollTo(0)
      setLoading(false)
    }
  }

  /**
   * function that handle scroll inside select popup
   * @param event
   */
  const handleScroll = (event: any) => {
    const target = event.target
    if (
      !loading &&
      target.scrollTop + target.offsetHeight === target.scrollHeight
    ) {
      if (paginationInfo && paginationInfo?.page < paginationInfo?.pageCount) {
        target.scrollTo(0, target.scrollHeight)
        setLoadingMore(true)
        const data = { ...bankSearch, page: bankSearch.page + 1 }
        setBankSearch(data)
        fetchBanks(data)
      } else {
        setLoadingMore(false)
      }
    }
  }

  /**
   * render bank list
   * @returns
   */
  const bankOptions = () => (
    <>
      {loading ? (
        <div style={{ height: 35, alignItems: 'center', textAlign: 'center' }}>
          <Spin />
        </div>
      ) : (
        <>
          {banks.map((item, index) => (
            <Select.Option
              value={item.tradingName}
              key={`bank-${index}-${item.id}`}
            >
              {item.name}
            </Select.Option>
          ))}
          {loadingMore && (
            <div
              style={{ height: 10, alignItems: 'center', textAlign: 'center' }}
            >
              <Spin />
            </div>
          )}
        </>
      )}
    </>
  )

  /**
   * this function handle action when select option in select
   * @param _
   * @param option
   */
  const handleSelect = (_: string, option: { value: string }) => {
    setVisible(false)
    if (option.value) {
      setLoadingMore(false)
    }
  }

  /**
   * this function handle action when blur select
   */
  const handleBlur = () => {
    setVisible(false)
  }

  return (
    <Card
      title={
        <SearchBar
          form={form}
          onFinish={handleSearch}
          // initialValues={{
          //   status: ''
          // }}
          headerMenu={
            <>
              <Form.Item
                label={t('napasToken.accountNumber')}
                name='cardNumber'
              >
                <Input
                  placeholder={t`napasToken.placeholders.accountNumber`.toString()}
                />
              </Form.Item>

              <Form.Item
                label={t('napasToken.from')}
                name='from'
              >
                <DatePicker
                  format={TimeFormat}
                  allowClear
                  className='w-100'
                  placeholder={t`napasToken.placeholders.start`.toString()}
                />
              </Form.Item>

              <Form.Item
                label={t('napasToken.to')}
                name='to'
              >
                <DatePicker
                  format={TimeFormat}
                  allowClear
                  className='w-100'
                  placeholder={t`napasToken.placeholders.end`.toString()}
                />
              </Form.Item>

              <Form.Item
                label={t('napasToken.banks')}
                name='bankName'
              >
                <Select
                  placeholder={t`napasToken.placeholders.bank`.toString()}
                  open={visible}
                  popupClassName='bank-list'
                  allowClear={true}
                  onBlur={handleBlur}
                  onSelect={handleSelect}
                  onPopupScroll={handleScroll}
                  onDropdownVisibleChange={(open) => handleOpenSelect(open)}
                >
                  {bankOptions()}
                </Select>
              </Form.Item>

              <Form.Item
                label={t('napasToken.status')}
                name='status'
              >
                <Select
                  options={[
                    { value: '', label: t('napasToken.statusCheck.all') },
                    {
                      value: true,
                      label: t('napasToken.statusCheck.success')
                    },
                    {
                      value: false,
                      label: t('napasToken.statusCheck.failed')
                    }
                  ]}
                />
              </Form.Item>

              <Button
                type='primary'
                htmlType='submit'
                icon={<SearchOutlined />}
              >{t`buttons.search`}</Button>
            </>
          }
        />
      }
    >
      <Table
        columns={tableColumns}
        dataSource={data?.data}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
        pagination={{
          current: data?.meta?.page,
          pageSize: 10,
          total: data?.meta?.itemCount,
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

export default NapasToken
