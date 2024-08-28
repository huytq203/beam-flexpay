import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Row,
  Select,
  SelectProps,
  Table,
  Tooltip
} from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/es/table'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'antd/es/form/Form'
import { PolicyManagementModal } from '../policy-management-modal/PolicyManagementModal'
import { pageEnum, SearchValueType, viewMode } from '@type/policyManagement'
import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import ButtonDelete from '@components/button-delete/ButtonDelete'
import { AiFillEye } from 'react-icons/ai'
import { CustomAccountGroupSelect } from '../components/SelectAccountGroup'
import { useLazyGetListGroupQuery } from '@services/apiAccountGroup'
import { useGetListTransactionLimitQuery } from '@services/limitRegulationService'
import {
  convertNumber,
  formatLimitTimeType,
  formatLimitType,
  formatLimitValueType,
  formatObjectPolicy,
  formatTransactionType
} from '@utils/helperFunctions'
import dayjs from 'dayjs'
import {
  APPLICABLE_OBJECTS,
  objects,
  transactionType
} from './LimitAndRegulationsConst'
import SearchBar from '@components/search-bar/SearchBar'

type SearchType = {
  page: number
  take: number
  accountGroup?: string
  depositMethod?: string[]
  object?: string
  account?: string
  serviceType?: string
  arr?: string
  applicableObject?: string
}

const LimitAndRegulation = () => {
  const { t: trans } = useTranslation()
  const [form] = useForm()

  const [search, setSearch] = useState<SearchType>({
    page: 1,
    take: 10,
    applicableObject: APPLICABLE_OBJECTS.ALL
  })
  const [searchValue, setSearchValue] = useState<SearchValueType>({
    accountGroupSearch: '',
    privateAccountSearch: ''
  })
  const [object, setObject] = useState<APPLICABLE_OBJECTS>(
    APPLICABLE_OBJECTS.ALL
  )
  const [open, setOpen] = useState<boolean>(false)
  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [selectedId, setSelectedId] = useState<number>()
  const [visibleConfirmModal, setVisibleConfirmModal] = useState<boolean>(false)

  const [triggerListAccountGroup, { data: listAccountGroup }] =
    useLazyGetListGroupQuery()

  const onCloseConfirmModal = () => {
    setVisibleConfirmModal(false)
  }

  const {
    data: ListLimitAndRegulations,
    isLoading: isLoadingLimitAndRegulations,
    refetch
  } = useGetListTransactionLimitQuery(search)

  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        dataIndex: 'id',
        key: 'id',
        align: 'center',
        title: trans`policy-management.limitAndRegulations.order`,
        render: (text, object, index) => (
          <div>
            {((ListLimitAndRegulations?.meta?.page as number) - 1) * 10 +
              index +
              1}
          </div>
        )
      },
      {
        dataIndex: 'name',
        key: 'note',
        align: 'center',
        title: `${trans`policy-management.limitAndRegulations.limitName`}`,
        width: 200
      },
      {
        key: 'type',
        align: 'center',
        title: `${trans`policy-management.limitAndRegulations.applicableObject`}`,
        render: (record) => (
          <div>{formatObjectPolicy(record?.applicableObject)}</div>
        )
      },
      {
        key: 'serviceType',
        align: 'center',
        title: `${trans`policy-management.limitAndRegulations.serviceType`}`,
        render: (record) => (
          <div>{formatTransactionType(record?.serviceType)}</div>
        )
      },
      {
        key: 'limitType',
        align: 'center',
        title: `${trans`policy-management.limitAndRegulations.limitType`}`,
        render: (record) => <div>{formatLimitType(record?.limitType)}</div>
      },
      {
        key: 'limitValueType',
        align: 'center',
        title: `${trans`policy-management.limitAndRegulations.limitValueType`}`,
        render: (record) => (
          <div>{formatLimitValueType(record?.valueTypeLimit)}</div>
        )
      },
      {
        key: 'limitValue',
        align: 'center',
        title: `${trans`policy-management.limitAndRegulations.limitValue`}`,
        render: (record) => <div>{convertNumber(record?.value)}</div>
      },
      {
        key: 'limitTime',
        align: 'center',
        title: `${trans`policy-management.limitAndRegulations.limitTime`}`,
        render: (record) => (
          <div>{formatLimitTimeType(record?.timeTypeApply)}</div>
        )
      },
      {
        key: 'applicableDate',
        align: 'center',
        title: `${trans`policy-management.limitAndRegulations.applicableDate`}`,
        render: (record) => (
          <div>{dayjs(record?.startDate).format('HH:mm:ss DD/MM/YYYY')}</div>
        )
      },
      {
        key: 'action',
        align: 'center',
        title: `${trans`policy-management.limitAndRegulations.action`}`,
        width: 150,
        render: (record) => (
          <Row
            gutter={5}
            justify='center'
          >
            <Col>
              <Tooltip
                placement='top'
                title={trans('tooltips.viewHistory')}
              >
                <Button
                  icon={<AiFillEye />}
                  onClick={() => {
                    setMode(viewMode.history)
                    setOpen(true)
                    setSelectedId(record.id)
                  }}
                />
              </Tooltip>
            </Col>
            <Col>
              <Tooltip
                placement='top'
                title={trans('tooltips.update')}
              >
                <ButtonUpdate
                  module='direct_deposit'
                  onClick={() => {
                    setMode(viewMode.update)
                    setOpen(true)
                    setSelectedId(record.id)
                  }}
                />
              </Tooltip>
            </Col>
            <Col>
              <Tooltip
                placement='top'
                title={trans('tooltips.delete')}
              >
                <ButtonDelete
                  module='direct_deposit'
                  onClick={() => {
                    setMode(viewMode.delete)
                    setOpen(true)
                    setSelectedId(record.id)
                  }}
                />
              </Tooltip>
            </Col>
          </Row>
        )
      }
    ],
    [ListLimitAndRegulations]
  )

  const onCancel = () => {
    if (mode === viewMode.history || mode === viewMode.delete) {
      setOpen(false)
    } else {
      setVisibleConfirmModal(true)
    }
  }

  const onSearch = (values: any) => {
    const newQuery: SearchType = {
      depositMethod: values.depositMethod,
      object: values.object,
      serviceType: values.serviceType,
      page: 1,
      take: search.take
    }
    if (object === APPLICABLE_OBJECTS.ACCOUNT_TYPE) {
      if (values.accountGroup) {
        const arr = values?.accountGroup
          .map((n: SelectProps) => `accountGroupId=${n.value}`)
          .join('&')
        newQuery.arr = arr
      }
    }
    if (object === APPLICABLE_OBJECTS.PRIVATE_ACCOUNT) {
      newQuery.account = values.accountNumber
    }
    setSearch(newQuery)
  }

  const onClear = (value: string) => {
    const newSearch = {
      ...search,
      page: 1,
      [value]: undefined
    }
    setSearch(newSearch)
  }

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              onFinish={onSearch}
              form={form}
            >
              <Row gutter={16}>
                <Col>
                  <Form.Item
                    name='object'
                    initialValue={APPLICABLE_OBJECTS.ALL}
                    label={trans`policy-management.common.applicableObject`}
                  >
                    <Select
                      onChange={(value) => {
                        setObject(value)
                        form.setFieldsValue({
                          accountGroup: undefined,
                          accountNumber: undefined
                        })
                      }}
                      style={{ minWidth: 190 }}
                    >
                      {objects.map((x) => {
                        return (
                          <Select.Option
                            key={x.value}
                            value={x.value}
                          >
                            {x.name}
                          </Select.Option>
                        )
                      })}
                    </Select>
                  </Form.Item>
                </Col>

                {[
                  APPLICABLE_OBJECTS.ACCOUNT_TYPE,
                  APPLICABLE_OBJECTS.PRIVATE_ACCOUNT
                ].includes(object) && (
                    <Col>
                      {object === APPLICABLE_OBJECTS.ACCOUNT_TYPE ? (
                        <Form.Item
                          name='accountGroup'
                          label={trans`policy-management.payment.selectAccountGroup`}
                        >
                          <CustomAccountGroupSelect
                            mode='multiple'
                            listAccountGroup={listAccountGroup}
                            setSearchValue={setSearchValue}
                            searchInput={searchValue}
                            placeholder={trans`policy-management.eWalletTransferMoneyManagement.placeholders.accountGroup`.toString()}
                            triggerFunction={triggerListAccountGroup}
                            onClearSearch={onClear}
                          />
                        </Form.Item>
                      ) : (
                        <Form.Item
                          name='accountNumber'
                          label={trans`policy-management.payment.inputAccount`}
                        >
                          <Input
                            placeholder={trans`policy-management.limitAndRegulations.placeholder.accountNumberPlaceholder`.toString()}
                          />
                        </Form.Item>
                      )}
                    </Col>
                  )}
                <Col>
                  <Form.Item
                    name='serviceType'
                    label={trans`policy-management.common.serviceTypeSelectTitle`}
                  >
                    <Select
                      // getPopupContainer={(trigger) => trigger.parentNode}
                      allowClear
                      style={{ minWidth: 190 }}
                      placeholder={trans`policy-management.limitAndRegulations.placeholder.transactionTypePlaceholder`.toString()}
                    >
                      {transactionType.map((el) => (
                        <Select.Option
                          key={el.value}
                          value={el.value}
                        >
                          {el.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row
                justify='end'
                style={{ marginBottom: '18px' }}
                gutter={16}
              >
                <Col>
                  <Button
                    icon={<SearchOutlined />}
                    htmlType='submit'
                    type='primary'
                  >{trans`policy-management.payment.search`}</Button>
                </Col>
                <Col>
                  <ButtonAdd
                    module='direct_deposit'
                    type='primary'
                    onClick={() => {
                      setMode(viewMode.create)
                      setOpen(true)
                    }}
                  >{trans`policy-management.payment.establish`}</ButtonAdd>
                </Col>
              </Row>
            </Form>
          }
        />
      }
    >
      <Table
        bordered
        dataSource={ListLimitAndRegulations?.data || []}
        columns={columns}
        scroll={{ x: '100%' }}
        locale={{
          emptyText: <Empty description={trans`labels.table-nodata`} />
        }}
        pagination={{
          current: ListLimitAndRegulations?.meta?.page || 1,
          pageSize: ListLimitAndRegulations?.meta?.take || 10,
          total: ListLimitAndRegulations?.meta?.itemCount || 0,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <PolicyManagementModal
        onCloseConfirmModal={onCloseConfirmModal}
        visibleConfirmModal={visibleConfirmModal}
        recordId={selectedId}
        refetch={refetch}
        page={pageEnum.limitAndRegulations}
        onCancel={onCancel}
        open={open}
        setOpen={setOpen}
        mode={mode}
        entityType='TRANSACTION_LIMIT'
      />
    </Card>
  )
}

export default LimitAndRegulation
