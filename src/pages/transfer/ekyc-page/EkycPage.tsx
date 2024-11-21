import ButtonSearch from '@components/button-search/ButtonSearch'
import CellContent from '@components/cell-content/CellContent'
import NoDataText from '@components/no-data-text/NoDataText'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat, TimeFullFormat } from '@constants/datetime'
import { useGetListEkycQuery } from '@services/apiEkycService'
import { IEkycSearch, IEkycType, StatusEkyc } from '@type/ekyc'
import { useBoolean } from 'ahooks'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Table
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil } from '@phosphor-icons/react'
import EkycDetail from '../ekyc-detail/EkycDetail'
import { blockArrowValue, blockLetterDecimal } from '@utils/helperFunctions'

const EkycPage = () => {
  const { t } = useTranslation()
  const [modal, { setFalse, setTrue }] = useBoolean(false)
  const [form] = useForm()
  const [selectedId, setSelectedId] = useState<string>('')
  const [search, setSearch] = useState<IEkycSearch>({ page: 1, take: 10 })

  const { data: ekyc } = useGetListEkycQuery(search as IEkycSearch)

  const ekycList = useMemo(() => {
    if (ekyc?.data && ekyc?.data.length > 0) {
      return ekyc?.data.map((item: IEkycType, index: number) => ({
        no: ((search?.page ?? 1) - 1) * 10 + index + 1,
        ...item
      }))
    } else return []
  }, [ekyc?.data])

  const handleModal = (id?: string) => {
    setTrue()
    if (id) setSelectedId(id)
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

  const renderStatus = (record: any) => {
    if (record === 'PENDING') {
      return t('ekyc.status.dangChoDuyet')
    } else if (record === 'REFUSED') {
      return t('ekyc.status.daHuy')
    } else {
      return t('ekyc.status.daDuyet')
    }
  }

  const ekycColumns: ColumnsType<IEkycType> = [
    {
      title: t('ekyc.number'),
      dataIndex: 'no',
      key: 'no',
      align: 'center',
      fixed: 'left'
    },
    {
      title: t('ekyc.accountNumber'),
      dataIndex: ['customer', 'phoneNumber'],
      key: 'phoneNumber',
      align: 'center',
      fixed: 'left'
    },
    {
      title: t('ekyc.statusLabel'),
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (record) => {
        return renderStatus(record)
      }
    },
    {
      title: t('ekyc.requestTime'),
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      align: 'center',
      render: (record) => dayjs(record).format(TimeFullFormat)
    },
    {
      title: t('ekyc.approvedDate'),
      dataIndex: 'verifiedAt',
      key: 'verifiedAt',
      align: 'center',
      render: (record) => (
        <CellContent
          data={record ? dayjs(record).format(TimeFullFormat) : <NoDataText />}
        />
      )
    },
    {
      title: t('ekyc.approvedBy'),
      dataIndex: ['verifier', 'fullName'],
      key: 'verifier',
      align: 'center'
    },
    {
      title: t('ekyc.functions'),
      align: 'center',
      fixed: 'right',
      render: (record: any) => (
        <Button
          icon={<Pencil />}
          onClick={() => handleModal(record.id)}
        />
      )
    }
  ]

  const handleSearch = (value: IEkycSearch) => {
    const newQuery = {
      ...value,
      from: value?.from
        ? dayjs(value?.from).startOf('day').toISOString()
        : undefined,
      to: value?.to ? dayjs(value?.to).endOf('day').toISOString() : undefined,
      status: value.status === '' ? undefined : value.status,
      phoneNumber: value.phoneNumber === '' ? undefined : value.phoneNumber,
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
              form={form}
              onFinish={handleSearch}
            >
              <Row gutter={GUTTER}>
                <Col flex='auto'>
                  <Form.Item
                    label={t('ekyc.accountNumber')}
                    name='phoneNumber'
                  >
                    <Input
                      onKeyDown={blockArrowValue}
                      onKeyPress={blockLetterDecimal}
                      allowClear
                      placeholder={t`ekyc.placeholder.accountNumber`.toString()}
                      onChange={(event) => {
                        if (
                          event.target.value === '' ||
                          event.target.value === undefined
                        ) {
                          refreshData('phoneNumber', event.target.value)
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col flex='300px'>
                  <Form.Item
                    label={t('ekyc.statusLabel')}
                    name='status'
                  >
                    <Select
                      allowClear
                      placeholder={t`ekyc.placeholder.status`.toString()}
                      options={[
                        {
                          label: t('ekyc.status.all'),
                          value: ''
                        },
                        {
                          label: t('ekyc.status.daDuyet'),
                          value: StatusEkyc.VERIFIED
                        },
                        {
                          label: t('ekyc.status.daHuy'),
                          value: StatusEkyc.REFUSED
                        },
                        {
                          label: t('ekyc.status.dangChoDuyet'),
                          value: StatusEkyc.PENDING
                        }
                      ]}
                      onChange={(event) => {
                        if (!event) {
                          refreshData('status', undefined)
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col flex='auto'>
                  <Form.Item
                    label={t('napasToken.from')}
                    name='from'
                  >
                    <DatePicker
                      className='w-100'
                      placeholder={t`napasToken.placeholders.start`.toString()}
                      format={TimeFormat}
                      disabledDate={(current) =>
                        current > dayjs() ||
                        current >= dayjs(form.getFieldValue('to'), 'YYYY-MM-DD')
                      }
                      onChange={(event) => {
                        if (!event) {
                          refreshData('from', undefined)
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col flex='auto'>
                  <Form.Item
                    label={t('napasToken.to')}
                    name='to'
                  >
                    <DatePicker
                      className='w-100'
                      placeholder={t`napasToken.placeholders.end`.toString()}
                      format={TimeFormat}
                      disabledDate={(current) =>
                        current > dayjs() ||
                        current <
                          dayjs(form.getFieldValue('from'), 'YYYY-MM-DD')
                      }
                      onChange={(event) => {
                        if (!event) {
                          refreshData('to', undefined)
                        }
                      }}
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
      <Table
        columns={ekycColumns}
        dataSource={ekycList || []}
        rowKey='id'
        size='small'
        scroll={{ x: '100%' }}
        bordered
        pagination={{
          current: ekyc?.meta?.page,
          pageSize: ekyc?.meta?.take,
          total: ekyc?.meta?.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      {modal && (
        <EkycDetail
          open={modal}
          close={setFalse}
          id={selectedId}
        />
      )}
    </Card>
  )
}
export default EkycPage
