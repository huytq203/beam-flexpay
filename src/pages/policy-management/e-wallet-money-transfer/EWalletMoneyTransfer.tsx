import { t } from 'i18next'
import { SearchOutlined } from '@ant-design/icons'
import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonDelete from '@components/button-delete/ButtonDelete'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import SearchBar from '@components/search-bar/SearchBar'
import { useLazyGetListGroupQuery } from '@services/apiAccountGroup'
import { useLazyGetCustomersQuery } from '@services/customerService'
import { applicableObjects } from '@constants/options'
import {
  useCreateTransferPolicyMutation,
  useGetListTransferPolicyQuery,
  useUpdateTransferPolicyMutation
} from '@services/transferPolicyServices'
import {
  APPLICABLE_OBJECTS,
  IPolicyTable,
  pageEnum,
  viewMode
} from '@type/policyManagement'
import { convertNumber, formatObjectPolicy } from '@utils/helperFunctions'
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Row,
  Select,
  SelectProps,
  Table
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AiFillEye } from 'react-icons/ai'
import { CustomAccountGroupSelect } from '../components/SelectAccountGroup'
import { CustomPrivateAccountSelect } from '../components/SelectPrivateAccount'
import { PolicyManagementModal } from '../policy-management-modal/PolicyManagementModal'

type SearchType = {
  page: number
  take: number
  accountGroup?: string
  depositMethod?: string[]
  object?: string
  accountNumber?: string
  applicableObjectId?: string
  arr?: string
  applicableObject?: string
}

export type SearchValueType = {
  accountGroupSearch: string
  privateAccountSearch: string
}

const EWalletMoneyTransferManagement = () => {
  const { t: trans } = useTranslation()
  const [form] = useForm()

  const [search, setSearch] = useState<SearchType>({
    page: 1,
    take: 10,
    applicableObject: APPLICABLE_OBJECTS.SYSTEM
  })
  const [searchValue, setSearchValue] = useState<SearchValueType>({
    accountGroupSearch: '',
    privateAccountSearch: ''
  })
  const [object, setObject] = useState<APPLICABLE_OBJECTS>(
    APPLICABLE_OBJECTS.SYSTEM
  )
  const [open, setOpen] = useState<boolean>(false)
  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [selectedItem, setSelectedItem] = useState<IPolicyTable | undefined>(
    undefined
  )

  const {
    data: dataList,
    isLoading,
    refetch
  } = useGetListTransferPolicyQuery(search)

  const [triggerListAccountGroup, { data: listAccountGroup }] =
    useLazyGetListGroupQuery()

  const [triggerListAccount, { data: listAccount }] = useLazyGetCustomersQuery()

  const [createPolicy, { isLoading: isLoadingCreatePolicy }] =
    useCreateTransferPolicyMutation()

  const [updatePolicy, { isLoading: isLoadingUpdatePolicy }] =
    useUpdateTransferPolicyMutation()

  const columns: ColumnsType<any> = [
    {
      dataIndex: 'id',
      align: 'center',
      title: trans`labels.no`,
      render: (text, object, index) => (
        <div>{((dataList?.meta?.page as number) - 1) * 10 + index + 1}</div>
      )
    },
    {
      align: 'center',
      title: trans`policy-management.eWalletTransferMoneyManagement.applicableObject`,
      render: (record) => (
        <div>{formatObjectPolicy(record?.applicableObject)}</div>
      )
    },
    {
      align: 'center',
      width: 100,

      title: `${trans`policy-management.eWalletTransferMoneyManagement.transactionFrom`}`,
      render: (record) => <div>{convertNumber(record?.transactionFrom)}</div>
    },
    {
      align: 'center',
      width: 100,
      title: `${trans`policy-management.eWalletTransferMoneyManagement.transactionTo`}`,
      render: (record) => <div>{convertNumber(record?.transactionTo)}</div>
    },
    {
      align: 'center',
      title: trans`policy-management.eWalletTransferMoneyManagement.transactionFee`,
      children: [
        {
          align: 'center',
          title: trans`policy-management.eWalletTransferMoneyManagement.onTransactor`,
          children: [
            {
              title: `${trans`policy-management.eWalletTransferMoneyManagement.flexibleFee`} (%)`,
              align: 'center',
              width: 100,
              render: (_, record) => (
                record.type === "FLEXIBLE"
                  ? <div>{convertNumber(record.transferorFlexibleFee, '%')}</div>
                  : <div>-</div>
              )
            },
            {
              title: `${trans`policy-management.eWalletTransferMoneyManagement.fixedCharge`} (VNĐ)`,
              align: 'center',
              width: 100,
              render: (_, record) => (
                <div>{convertNumber(record.type === "FIXED" ? record.transferorFixedFee : null)}</div>
              )
            },
            {
              title: `${trans`policy-management.eWalletTransferMoneyManagement.minFee`} (VNĐ)`,
              align: 'center',
              width: 100,
              render: (_, record) => (
                <div>{convertNumber(record.type === "FLEXIBLE" ? record.transferorFeeMin : null)}</div>
              )
            },
            {
              title: `${trans`policy-management.eWalletTransferMoneyManagement.maxFee`} (VNĐ)`,
              align: 'center',
              width: 100,
              render: (record) => (
                <div>{convertNumber(record.type === "FLEXIBLE" ? record.transferorFeeMax : null)}</div>
              )
            }
          ]
        },
        {
          align: 'center',
          title: trans`policy-management.eWalletTransferMoneyManagement.onReceiver`,

          children: [
            {
              title: `${trans`policy-management.eWalletTransferMoneyManagement.flexibleFee`} (%)`,
              align: 'center',
              width: 100,
              render: (record) => (
                <div>{convertNumber(record.type === "FLEXIBLE" ? record.receiverFlexibleFee : null, '%')}</div>
              )
            },
            {
              title: `${trans`policy-management.eWalletTransferMoneyManagement.fixedCharge`} (VNĐ)`,
              align: 'center',
              width: 100,
              render: (record) => (
                <div>{convertNumber(record.type === "FIXED" ? record.receiverFixedFee : null)}</div>
              )
            },
            {
              title: `${trans`policy-management.eWalletTransferMoneyManagement.minFee`} (VNĐ)`,
              align: 'center',
              width: 100,
              render: (record) => (
                <div>{convertNumber(record.type === "FLEXIBLE" ? record.receiverFeeMin : null)}</div>
              )
            },
            {
              title: `${trans`policy-management.eWalletTransferMoneyManagement.maxFee`} (VNĐ)`,
              align: 'center',
              width: 100,
              render: (record) => (
                <div>{convertNumber(record.type === "FLEXIBLE" ? record.receiverFeeMax : null)}</div>
              )
            }
          ]
        }
      ]
    },
    {
      align: 'center',
      width: 150,
      title: `${trans`policy-management.eWalletTransferMoneyManagement.applicableDate`}`,
      render: (record) => (
        <div>{dayjs(record?.startDate).format('HH:mm:ss DD/MM/YYYY')}</div>
      )
    },
    {
      align: 'center',
      width: 150,
      title: `${trans`policy-management.eWalletTransferMoneyManagement.endDate`}`,
      render: (record) => (
        <div>
          {record.endDate
            ? dayjs(record?.endDate).format('HH:mm:ss DD/MM/YYYY')
            : '-'}
        </div>
      )
    },
    {
      align: 'center',
      title: `${trans`policy-management.eWalletTransferMoneyManagement.policyHistory`}`,
      render: (record) => (
        <Button
          onClick={() => {
            setMode(viewMode?.history)
            setOpen(true)
            setSelectedItem(record)
          }}
          icon={<AiFillEye />}
        />
      )
    },
    {
      align: 'center',
      title: `${trans`policy-management.eWalletTransferMoneyManagement.edit`}`,
      render: (record) => (
        <ButtonUpdate
          onClick={() => {
            setMode(viewMode?.update)
            setOpen(true)
            setSelectedItem(record)
          }}
          module='wallet_transfer'
        />
      )
    },
    {
      align: 'center',
      title: `${trans`policy-management.eWalletTransferMoneyManagement.cancel`}`,
      render: (record) => (
        <ButtonDelete
          onClick={() => {
            setMode(viewMode.delete)
            setOpen(true)
            setSelectedItem(record)
          }}
          module='wallet_transfer'
        />
      )
    }
  ]

  const onCancel = () => {
    setOpen(false)
  }

  const onSearch = (values: any) => {
    const newQuery: SearchType = {
      object: values.object,
      page: 1,
      take: search.take
    }
    if (object === APPLICABLE_OBJECTS.ACCOUNT_GROUP) {
      if (values.accountGroup) {
        const arr = values?.accountGroup
          .map((n: SelectProps) => `applicableObjectId=${n.value}`)
          .join('&')
        newQuery.arr = arr
      }
    }
    if (object === APPLICABLE_OBJECTS.PERSONAL_ACCOUNT) {
      if (values.accountNumber) {
        const arr = values?.accountNumber
          .map((n: SelectProps) => `applicableObjectId=${n.value}`)
          .join('&')
        newQuery.arr = arr
      }
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
                    label={trans`policy-management.payment.applicableObject`}
                    initialValue={APPLICABLE_OBJECTS.ALL}
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
                      options={[{
                        value: APPLICABLE_OBJECTS.ALL,
                        label: t`policy-management.payment.all`
                      }, ...applicableObjects]}
                    />
                  </Form.Item>
                </Col>
                {[
                  APPLICABLE_OBJECTS.PERSONAL_ACCOUNT,
                  APPLICABLE_OBJECTS.ACCOUNT_GROUP
                ].includes(object) && (
                    <Col>
                      {object === APPLICABLE_OBJECTS.ACCOUNT_GROUP ? (
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
                          <CustomPrivateAccountSelect
                            mode='multiple'
                            listAccount={listAccount}
                            setSearchValue={setSearchValue}
                            searchInput={searchValue}
                            placeholder={trans`policy-management.payment.accountNumberPlaceholder`.toString()}
                            triggerFunction={triggerListAccount}
                            onClearSearch={onClear}
                          />
                        </Form.Item>
                      )}
                    </Col>
                  )}
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
                    module='wallet_transfer'
                    type='primary'
                    onClick={() => {
                      setMode(viewMode.create)
                      setOpen(true)
                    }}
                    label={trans`policy-management.payment.establish`.toString()}
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
        dataSource={dataList?.data || []}
        columns={columns}
        scroll={{ x: '100%' }}
        locale={{
          emptyText: <Empty description={trans`labels.table-nodata`} />
        }}
        pagination={{
          current: dataList?.meta?.page || 1,
          pageSize: dataList?.meta?.take || 10,
          total: dataList?.meta?.itemCount || 0,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <PolicyManagementModal
        recordId={selectedItem?.id}
        isLoadingCreate={isLoadingCreatePolicy}
        isLoadingUpdate={isLoadingUpdatePolicy}
        createPolicy={createPolicy}
        updatePolicy={updatePolicy}
        record={selectedItem}
        refetch={refetch}
        page={pageEnum.eWalletTransferMoney}
        onCancel={onCancel}
        open={open}
        mode={mode}
      />
    </Card>
  )
}

export default EWalletMoneyTransferManagement