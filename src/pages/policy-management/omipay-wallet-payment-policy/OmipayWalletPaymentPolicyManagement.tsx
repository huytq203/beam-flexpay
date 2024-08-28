import { SearchOutlined } from '@ant-design/icons'
import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonDelete from '@components/button-delete/ButtonDelete'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import { useLazyGetListGroupQuery } from '@services/apiAccountGroup'
import { useSystemFeeManagementGetPolicyPaymentWithFlexpayListQuery as findAllQuery } from '@services/cmsFee'
import { useLazyGetCustomersQuery } from '@services/customerService'
import {
  useCreateOmipayPolicyMutation,
  useUpdateOmipayPolicyMutation
} from '@services/omypayPolicyService'
import { SystemFeeManagementGetPolicyPaymentWithFlexpayListApiArg as findAllArgs } from '@type/application'
import {
  APPLICABLE_OBJECTS,
  IPolicyTable,
  SearchValueType,
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
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AiFillEye } from 'react-icons/ai'
import { objects } from '../../../app/types/policyManagement'
import { CustomAccountGroupSelect } from '../components/SelectAccountGroup'
import { CustomPrivateAccountSelect } from '../components/SelectPrivateAccount'
import { PolicyManagementModal } from '../policy-management-modal/PolicyManagementModal'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFullFormat } from '@constants/datetime'

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

const OmipayWalletPaymentPolicyManagement = () => {
  const { t } = useTranslation()
  const [form] = useForm()

  const [search, setSearch] = useState<findAllArgs>({
    page: 1,
    take: 10,
    applicableObject: APPLICABLE_OBJECTS.ALL
  })

  const [selectedItem, setSelectedItem] = useState<IPolicyTable | undefined>(
    undefined
  )
  const [searchValue, setSearchValue] = useState<SearchValueType>({
    accountGroupSearch: '',
    privateAccountSearch: ''
  })
  const [object, setObject] = useState<APPLICABLE_OBJECTS>(
    APPLICABLE_OBJECTS.SYSTEM
  )
  const [open, setOpen] = useState<boolean>(false)
  const [mode, setMode] = useState<viewMode>(viewMode.create)

  const { data: listPolicy, refetch } = findAllQuery(search)

  const [triggerListAccountGroup, { data: listAccountGroup }] =
    useLazyGetListGroupQuery()

  const [triggerListAccount, { data: listAccount }] = useLazyGetCustomersQuery()

  const [createPolicy, { isLoading: isLoadingCreatePolicy }] =
    useCreateOmipayPolicyMutation()

  const [updatePolicy, { isLoading: isLoadingUpdatePolicy }] =
    useUpdateOmipayPolicyMutation()

  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        dataIndex: 'id',
        align: 'center',
        title: t`policy-management.eWalletTransferMoneyManagement.order`,
        render: (text, object, index) => (
          <div>{((listPolicy?.meta?.page as number) - 1) * 10 + index + 1}</div>
        ),
        width: 100,
        fixed: 'left'
      },
      {
        align: 'center',
        title: t`policy-management.eWalletTransferMoneyManagement.applicableObject`,
        render: (record) => (
          <div>{formatObjectPolicy(record.applicableObject)}</div>
        ),
        width: 200,
        fixed: 'left'
      },
      {
        align: 'center',
        title: `${t`policy-management.eWalletTransferMoneyManagement.transactionFrom`}`,
        render: (record) => <div>{convertNumber(record.transactionFrom)}</div>,
        width: 200,
        fixed: 'left'
      },
      {
        align: 'center',
        title: `${t`policy-management.eWalletTransferMoneyManagement.transactionTo`}`,
        render: (record) => <div>{convertNumber(record.transactionTo)}</div>,
        width: 200
      },
      {
        align: 'center',
        title: t`policy-management.eWalletTransferMoneyManagement.transactionFee`,
        children: [
          {
            align: 'center',
            title: t`policy-management.eWalletTransferMoneyManagement.onTransactor`,
            children: [
              {
                title: `${t`policy-management.eWalletTransferMoneyManagement.flexibleFee`} (%)`,
                align: 'center',
                width: 100,
                render: (record) => (
                  <div>{convertNumber(record.transferorFlexibleFee, '%')}</div>
                )
              },
              {
                title: `${t`policy-management.eWalletTransferMoneyManagement.fixedCharge`} (VNĐ)`,
                align: 'center',
                width: 100,
                render: (record) => (
                  <div>{convertNumber(record.transferorFixedFee)}</div>
                )
              },
              {
                title: `${t`policy-management.eWalletTransferMoneyManagement.minFee`} (VNĐ)`,
                align: 'center',
                width: 100,
                render: (record) => (
                  <div>{convertNumber(record.transferorFeeMin)}</div>
                )
              },
              {
                title: `${t`policy-management.eWalletTransferMoneyManagement.maxFee`} (VNĐ)`,
                align: 'center',
                width: 100,
                render: (record) => (
                  <div>{convertNumber(record.transferorFeeMax)}</div>
                )
              }
            ]
          },
          {
            align: 'center',
            title: t`policy-management.eWalletTransferMoneyManagement.onReceiver`,
            children: [
              {
                title: `${t`policy-management.eWalletTransferMoneyManagement.flexibleFee`} (%)`,
                align: 'center',
                width: 100,
                render: (record) => (
                  <div>{convertNumber(record.receiverFlexibleFee, '%')}</div>
                )
              },
              {
                title: `${t`policy-management.eWalletTransferMoneyManagement.fixedCharge`} (VNĐ)`,
                align: 'center',
                width: 100,
                render: (record) => (
                  <div>{convertNumber(record.receiverFixedFee)}</div>
                )
              },
              {
                title: `${t`policy-management.eWalletTransferMoneyManagement.minFee`} (VNĐ)`,
                align: 'center',
                width: 100,
                render: (record) => (
                  <div>{convertNumber(record.receiverFeeMin)}</div>
                )
              },
              {
                title: `${t`policy-management.eWalletTransferMoneyManagement.maxFee`} (VNĐ)`,
                align: 'center',
                width: 100,
                render: (record) => (
                  <div>{convertNumber(record.receiverFeeMax)}</div>
                )
              }
            ]
          }
        ]
      },
      {
        align: 'center',
        width: 150,
        title: `${t`policy-management.eWalletTransferMoneyManagement.applicableDate`}`,
        render: (record) => (
          <div>{dayjs(record.startDate).format(TimeFullFormat)}</div>
        )
      },
      {
        align: 'center',
        width: 150,
        title: `${t`policy-management.eWalletTransferMoneyManagement.endDate`}`,
        render: (record) => (
          <div>
            {record.endDate
              ? dayjs(record.endDate).format(TimeFullFormat)
              : '-'}
          </div>
        )
      },
      {
        align: 'center',
        title: `${t`policy-management.eWalletTransferMoneyManagement.policyHistory`}`,
        width: 200,
        ellipsis: true,
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
        title: `${t`policy-management.eWalletTransferMoneyManagement.edit`}`,
        width: 100,
        fixed: 'right',
        render: (record) => (
          <ButtonUpdate
            onClick={() => {
              setMode(viewMode.update)
              setOpen(true)
              setSelectedItem(record)
            }}
            module='wallet_transfer'
          />
        )
      },
      {
        align: 'center',
        title: `${t`policy-management.eWalletTransferMoneyManagement.cancel`}`,
        width: 100,
        fixed: 'right',
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
    ],
    [listPolicy]
  )

  const onCancel = () => {
    setOpen(false)
  }

  const onSearch = (values: any) => {
    const newQuery: SearchType = {
      object: values.object,
      page: 1,
      take: search.take || 10
    }
    if (object === APPLICABLE_OBJECTS.ACCOUNT_GROUP) {
      if (values?.accountGroup) {
        const arr = values?.accountGroup
          .map((n: SelectProps) => `applicableObjectId=${n.value}`)
          .join('&')
        newQuery.arr = arr
      }
    }
    if (object === APPLICABLE_OBJECTS.PERSONAL_ACCOUNT) {
      if (values?.accountNumber) {
        const arr = values?.accountNumber
          .map((n: SelectProps) => `applicableObjectId=${n.value}`)
          .join('&')
        newQuery.arr = arr
      }
    }
    setSearch(newQuery as findAllArgs)
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
              <Row gutter={GUTTER}>
                <Col>
                  <Form.Item
                    name='object'
                    label={t`policy-management.payment.applicableObject`}
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
                      // getPopupContainer={(trigger) => trigger.parentNode}
                      style={{ minWidth: 190 }}
                    >
                      {[{
                        value: APPLICABLE_OBJECTS.ALL,
                        label: t`policy-management.payment.all`
                      }, ...objects].map((x) => {
                        return (
                          <Select.Option
                            key={x.value}
                            value={x.value}
                          >
                            {x.label}
                          </Select.Option>
                        )
                      })}
                    </Select>
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
                          label={t`policy-management.payment.selectAccountGroup`}
                        >
                          <CustomAccountGroupSelect
                            mode='multiple'
                            listAccountGroup={listAccountGroup}
                            setSearchValue={setSearchValue}
                            searchInput={searchValue}
                            placeholder={t`policy-management.eWalletTransferMoneyManagement.placeholders.accountGroup`.toString()}
                            triggerFunction={triggerListAccountGroup}
                            onClearSearch={onClear}
                          />
                        </Form.Item>
                      ) : (
                        <Form.Item
                          name='accountNumber'
                          label={t`policy-management.payment.inputAccount`}
                        >
                          <CustomPrivateAccountSelect
                            mode='multiple'
                            listAccount={listAccount}
                            setSearchValue={setSearchValue}
                            searchInput={searchValue}
                            placeholder={t`policy-management.payment.accountNumberPlaceholder`.toString()}
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
                gutter={GUTTER}
              >
                <Col>
                  <Button
                    icon={<SearchOutlined />}
                    htmlType='submit'
                    type='primary'
                  >{t`policy-management.payment.search`}</Button>
                </Col>
                <Col>
                  <ButtonAdd
                    module='wallet_payment'
                    type='primary'
                    onClick={() => {
                      setMode(viewMode.create)
                      setOpen(true)
                    }}
                    label={t`policy-management.payment.establish`.toString()}
                  >{t`policy-management.payment.establish`}</ButtonAdd>
                </Col>
              </Row>
            </Form>
          }
        />
      }
    >
      <Table
        bordered
        columns={columns}
        scroll={{ x: '100%' }}
        dataSource={listPolicy?.data || []}
        locale={{
          emptyText: <Empty description={t`labels.table-nodata`} />
        }}
        pagination={{
          current: listPolicy?.meta?.page || 1,
          pageSize: listPolicy?.meta?.take || 10,
          total: listPolicy?.meta?.itemCount || 0,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      {open && (
        <PolicyManagementModal
          recordId={selectedItem?.id}
          isLoadingCreate={isLoadingCreatePolicy}
          isLoadingUpdate={isLoadingUpdatePolicy}
          createPolicy={createPolicy}
          updatePolicy={updatePolicy}
          record={selectedItem}
          refetch={refetch}
          page={pageEnum.omipayPayment}
          onCancel={onCancel}
          open={open}
          mode={mode}
          entityType={'SYSTEM_FEE_MANAGEMENT'}
        />
      )}
    </Card>
  )
}

export default OmipayWalletPaymentPolicyManagement
