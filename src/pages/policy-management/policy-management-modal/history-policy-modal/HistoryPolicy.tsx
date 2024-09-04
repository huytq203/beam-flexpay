import CellContent from '@components/cell-content/CellContent'
import { TimeFullFormat } from '@constants/datetime'
import { historyType } from '@constants/options'
import { SelectAdminAccount } from '@pages/policy-management/components/SelectAdminAccount'
import { useGetListHistoryQuery } from '@services/apiDirectDeposit'
import { HistoryPolicyInterface, pageEnum } from '@type/policyManagement'
import {
  formatHistoryData,
  formatObjectHistory,
  getNameColumnTypeChange,
  getTypeHistory
} from '@utils/helperFunctions'
import { Button, Col, DatePicker, Empty, Form, Row, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import Table, { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { isNumber, isString } from 'lodash'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type HistoryPolicyType = {
  policyId?: number
  onCancel: () => void
  module: pageEnum
  entityType: string
}

type SearchType = {
  page: number
  take: number
  orderBy: string
  systemFeeManagementId?: number
  updatedAt?: string
  historyType?: string
  updater?: string
}

export const HistoryPolicy = ({
  policyId,
  onCancel,
  module,
  entityType
}: HistoryPolicyType) => {
  const { t: trans } = useTranslation()
  const [form] = useForm()

  const [search, setSearch] = useState<SearchType>({
    page: 1,
    take: 10,
    orderBy: 'updater'
  })

  const { data } = useGetListHistoryQuery({
    entityId: policyId,
    entityType: entityType,
    ...search
  })

  const renderValue = (value: string, record: HistoryPolicyInterface) => {
    if (
      (value && record && record.valueType === 'Ngày kết thúc') ||
      record.valueType === 'Ngày áp dụng' ||
      record.valueType === 'Thời gian áp dụng'
    ) {
      return dayjs(value).format(TimeFullFormat)
    } else if (record.valueType === 'Loại phí') {
      return value == 'FIXED' ? 'Cố định' : 'Linh hoạt'
    } else {
      if (value === null) return
      try {
        const objectValue = JSON.parse(value)
        if (value && (isString(objectValue) || isNumber(objectValue))) {
          return <span>{value}</span>
        }
        return (
          <>
            {objectValue &&
              Object.entries(objectValue).map(([key, value], index) => (
                <div
                  key={`${index}-${key}`}
                  style={{
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    flexFlow: 'column'
                  }}
                >
                  <h4>{key}:</h4>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatObjectHistory(value, key)
                    }}
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                </div>
              ))}
          </>
        )
      } catch (error) {
        // if value contain html tag return html
        if (value.includes('<')) {
          return <div dangerouslySetInnerHTML={{ __html: value }} />
        }
        return formatHistoryData(value);
      }
    }
  }

  const columns: ColumnsType<HistoryPolicyInterface> = useMemo(
    () => [
      {
        title: trans('labels.id'),
        dataIndex: 'no',
        key: 'id',
        align: 'center',
        width: 60
      },
      {
        title: trans('policy-management.history.history-type'),
        dataIndex: 'historyType',
        key: 'id',
        align: 'center',
        width: 100,
        render: (record) => <CellContent data={getTypeHistory(record)} />
      },
      {
        title: trans('policy-management.history.update-date'),
        dataIndex: 'updatedAt',
        key: 'id',
        align: 'center',
        width: 180,
        render: (record) =>
          record ? dayjs(record).format(TimeFullFormat) : trans`lables.nodata`
      },
      {
        title: trans('policy-management.history.update-person'),
        dataIndex: 'user',
        key: 'id',
        align: 'center',
        render: (record) => <CellContent data={record?.fullName} />
      },
      {
        title: trans('policy-management.history.value-type'),
        dataIndex: 'valueType',
        key: 'id',
        align: 'center',
        render: (record, value) => (
          getNameColumnTypeChange(value?.valueType)
        ),
        width: 220,
        ellipsis: true
      },
      {
        title: trans('policy-management.history.new-value'),
        dataIndex: 'newValue',
        key: 'id',
        align: 'center',
        render: (record, values) => renderValue(record, values),
        ellipsis: true
      },
      {
        title: trans('policy-management.history.old-value'),
        dataIndex: 'oldValue',
        key: 'id',
        align: 'center',
        render: (record, values) => renderValue(record, values),
        ellipsis: true
      },
      {
        title: trans('policy-management.history.creator'),
        dataIndex: 'userNameCreate',
        key: 'id',
        align: 'center',
        render: (record) => <CellContent data={record} />
      },
      {
        title: trans('policy-management.history.createdAt'),
        dataIndex: 'createdAt',
        key: 'id',
        align: 'center',
        width: 180,
        render: (record) =>
          record ? dayjs(record).format(TimeFullFormat) : trans`lables.nodata`
      }
    ],
    []
  )

  const historyList = useMemo(() => {
    if (data?.data && data.data.length > 0) {
      return data?.data?.map((item: HistoryPolicyInterface, index: number) => ({
        no: ((search?.page ?? 1) - 1) * 10 + index + 1,
        ...item
      }))
    } else return []
  }, [data?.data])

  const submit = (value: any) => {
    const newQuery = {
      ...search,
      ...value,
      historyType: value?.historyType !== '' ? value?.historyType : undefined,
      updatedAt: value?.updatedAt
        ? dayjs(value?.updatedAt).toISOString()
        : undefined
    }
    setSearch(newQuery)
  }

  const reload = (field: string) => {
    const newSearch = {
      ...search,
      page: 1,
      [field]: undefined
    }
    setSearch(newSearch)
  }

  return (
    <>
      <Form
        form={form}
        layout='vertical'
        onFinish={submit}
        initialValues={{ historyType: '' }}
      >
        <Row gutter={32}>
          <Col
            xs={24}
            md={12}
            lg={6}
          >
            <Form.Item
              name='historyType'
              label={trans('policy-management.history.history-type')}
            >
              <Select
                allowClear={false}
                options={historyType}
                placeholder={trans(
                  'policy-management.history.placeholders.history-type'
                )}
              />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={12}
            lg={6}
          >
            <Form.Item
              name='updatedAt'
              label={trans('policy-management.history.update-date')}
            >
              <DatePicker
                allowClear
                className='w-100'
                placeholder={trans`policy-management.history.placeholders.update-date`.toString()}
                onChange={(e) => {
                  if (!e) {
                    reload('updatedAt')
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={12}
            lg={6}
          >
            <Form.Item
              name='updater_id'
              label={trans('policy-management.history.update-person')}
            >
              <SelectAdminAccount
                placeholder={trans(
                  'policy-management.history.placeholders.update-person'
                ).toString()}
                onClear={reload}
              />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={12}
            lg={6}
            className='text-end mt-30'
          >
            <Button
              type='primary'
              htmlType='submit'
            >{trans`buttons.search`}</Button>
          </Col>
        </Row>
      </Form>
      <Table
        style={{ maxHeight: 350, overflowY: 'scroll' }}
        sticky={true}
        bordered
        dataSource={historyList ?? []}
        columns={columns}
        scroll={{ x: '100%' }}
        locale={{
          emptyText: <Empty description={trans`labels.table-nodata`} />
        }}
        pagination={{
          current: search.page || 1,
          pageSize: search.take || 10,
          total: data?.meta?.itemCount || 0,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <div className='text-end mt-10'>
        <Button
          type='primary'
          onClick={onCancel}
        >{trans`buttons.close`}</Button>
      </div>
    </>
  )
}
