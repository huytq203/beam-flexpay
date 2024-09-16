import { SearchOutlined } from '@ant-design/icons'
import { AuditLogManagementModal } from '@components/audit-log/AuditLogManagementModal'
import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonDelete from '@components/button-delete/ButtonDelete'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import CellContent from '@components/cell-content/CellContent'
import CustomPaymentMethod from '@components/custom-payment-method/CustomPaymentMethod'
import SearchBar from '@components/search-bar/SearchBar'
import { applicableObjects } from '@constants/options'
import { useLazyGetListGroupQuery } from '@services/apiAccountGroup'
import { useSystemFeeManagementGetPolicyPaymentWithBankCardListQuery as findAllQuery } from '@services/cmsFee'
import { useLazyGetCustomersQuery } from '@services/customerService'
import { SystemFeeManagementGetPolicyPaymentWithBankCardListApiArg as findAllArgs } from '@type/application'
import {
  APPLICABLE_OBJECTS,
  pageEnum,
  SearchType,
  SearchValueType,
  viewMode
} from '@type/policyManagement'
import { convertNumber, getApplicableObject } from '@utils/helperFunctions'
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Modal,
  Row,
  Select,
  Table,
  Tooltip
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { t } from 'i18next'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AiOutlineHistory } from 'react-icons/ai'
import { CustomAccountGroupSelect } from '../components/SelectAccountGroup'
import { CustomPrivateAccountSelect } from '../components/SelectPrivateAccount'
import { DeletePolicyModal } from '../policy-management-modal/delete-modal/DeletePolicyModal'

const AccountAndBankPaymentManagement = () => {
  const { t: trans } = useTranslation()
  const [form] = Form.useForm()

  const [openSetting, setOpenSetting] = useState(false)
  const [search, setSearch] = useState<findAllArgs>({
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
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [open, setOpen] = useState<boolean>(false)
  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [selectedRecord, setSelectedRecord] = useState<number | undefined>(
    undefined
  )

  // const { data, refetch } = useGetListBankPaymentPolicyQuery(search)
  const { data, refetch } = findAllQuery(search)

  const [triggerListAccountGroup, { data: listAccountGroup }] =
    useLazyGetListGroupQuery()
  const [triggerListAccount, { data: listAccount }] = useLazyGetCustomersQuery()

  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        align: 'center',
        title: trans`labels.no`,
        dataIndex: 'id',
        render: (text, object, index) => (
          <div>{((data?.meta?.page as number) - 1) * 10 + index + 1}</div>
        )
      },
      {
        align: 'center',
        title: trans`policy-management.payment.applicableObject`,
        dataIndex: 'applicableObject',
        width: 120,
        render: (record) => <CellContent data={getApplicableObject(record)} />
      },
      {
        align: 'center',
        title: `${trans`policy-management.payment.paymentMethod`}`,
        dataIndex: 'depositMethods',
        width: 200,
        render: (record) => <CellContent data={record} />
      },
      {
        align: 'center',
        title: `${trans`policy-management.payment.transactionLevelFrom`} (VNĐ)`,
        dataIndex: 'transactionFrom',
        width: 100,
        render: (record) => <div>{convertNumber(record)}</div>
      },
      {
        align: 'center',
        title: `${trans`policy-management.payment.transactionLevelTo`} (VNĐ)`,
        dataIndex: 'transactionTo',
        width: 100,
        render: (record) => <div>{convertNumber(record)}</div>
      },
      {
        align: 'center',
        title: trans`policy-management.payment.transactionFee`,
        children: [
          {
            align: 'center',
            title: trans`policy-management.payment.onTransactor`,
            children: [
              {
                title: `${trans`policy-management.payment.flexibleFee`} (%)`,
                align: 'center',
                width: 100,
                dataIndex: 'transferorFlexibleFee',
                render: (record) => <div>{convertNumber(record, '%')}</div>
              },
              {
                title: `${trans`policy-management.payment.fixedCharge`} (VNĐ)`,
                align: 'center',
                width: 100,
                dataIndex: 'transferorFixedFee',
                render: (record) => <div>{convertNumber(record)}</div>
              },
              {
                title: `${trans`policy-management.payment.minFee`} (VNĐ)`,
                align: 'center',
                dataIndex: 'transferorFeeMin',
                width: 100,
                render: (record) => <div>{convertNumber(record)}</div>
              },
              {
                title: `${trans`policy-management.payment.maxFee`} (VNĐ)`,
                align: 'center',
                dataIndex: 'transferorFeeMax',
                width: 100,
                render: (record) => <div>{convertNumber(record)}</div>
              }
            ]
          },
          {
            align: 'center',
            title: trans`policy-management.payment.onReceiver`,
            children: [
              {
                title: `${trans`policy-management.payment.flexibleFee`} (%)`,
                align: 'center',
                width: 100,
                dataIndex: 'receiverFlexibleFee',
                render: (record) => <div>{convertNumber(record, '%')}</div>
              },
              {
                title: `${trans`policy-management.payment.fixedCharge`} (VNĐ)`,
                align: 'center',
                width: 100,
                dataIndex: 'receiverFixedFee',
                render: (record) => <div>{convertNumber(record)}</div>
              },
              {
                title: `${trans`policy-management.payment.minFee`} (VNĐ)`,
                align: 'center',
                width: 100,
                dataIndex: 'receiverFeeMin',
                render: (record) => <div>{convertNumber(record)}</div>
              },
              {
                title: `${trans`policy-management.payment.maxFee`} (VNĐ)`,
                align: 'center',
                width: 100,
                dataIndex: 'receiverFeeMax',
                render: (record) => <div>{convertNumber(record)}</div>
              }
            ]
          }
        ]
      },
      {
        align: 'center',
        title: `${trans`policy-management.payment.applicableDate`}`,
        dataIndex: 'startDate',
        width: 150,
        render: (record) => (
          <div>
            {record ? dayjs(record).format('HH:mm:ss DD/MM/YYYY') : '-'}
          </div>
        )
      },
      {
        align: 'center',
        title: `${trans`policy-management.payment.endDate`}`,
        dataIndex: 'endDate',
        width: 150,
        render: (record) => (
          <div>
            {record ? dayjs(record).format('HH:mm:ss DD/MM/YYYY') : '-'}
          </div>
        )
      },
      {
        align: 'center',
        width: 80,
        title: `${trans`policy-management.payment.policyHistory`}`,
        render: (record) => (
          <Tooltip title={trans`buttons.history`}>
            <Button
              icon={<AiOutlineHistory />}
              onClick={() => {
                setMode(viewMode.history)
                setSelectedRecord(record.id)
                setOpen(true)
              }}
            />
          </Tooltip>
        )
      },
      {
        align: 'center',
        width: 80,
        title: `${trans`policy-management.payment.edit`}`,
        render: (record) => (
          <Tooltip title={trans`buttons.update`}>
            <ButtonUpdate
              module=''
              onClick={() => {
                setMode(viewMode.update)
                setSelectedRecord(record.id)
                setOpen(true)
              }}
            />
          </Tooltip>
        )
      },
      {
        align: 'center',
        width: 80,
        title: `${trans`policy-management.payment.cancel`}`,
        render: (record) => (
          <Tooltip title={trans`buttons.delete`}>
            <ButtonDelete
              module=''
              onClick={() => {
                setMode(viewMode.delete)
                setSelectedRecord(record.id)
                setOpen(true)
              }}
            />
          </Tooltip>
        )
      }
    ],
    [data]
  )

  const onClearSearch = (field: string) => {
    const newSearch = {
      ...search,
      page: 1,
      [field]: undefined
    }
    setSearch(newSearch)
  }

  const handleSelectMethod = (values: number[] | string, status?: string) => {
    if (typeof status === 'string' && status === 'all') {
      form.setFieldsValue({
        depositMethod: undefined
      })
      return
    }

    form.setFieldsValue({
      depositMethod: values
    })
  }

  const onSearch = (values: any) => {
    const { applicableObject, accountGroup, accountNumber, depositMethod } =
      values

    if (depositMethod?.length === 0) {
      return
    }

    let objectIds
    switch (applicableObject) {
      case APPLICABLE_OBJECTS.ACCOUNT_GROUP:
        objectIds = accountGroup?.map((item: any) => item.value)
        break
      case APPLICABLE_OBJECTS.PERSONAL_ACCOUNT:
        objectIds = accountNumber?.map((item: any) => item.value)
        break
      default:
        objectIds = undefined
        break
    }

    const params =
      objectIds || depositMethod ? new URLSearchParams() : undefined
    objectIds &&
      params &&
      objectIds.forEach((value: any) =>
        params.append('applicableObjectId', value)
      )

    params &&
      depositMethod &&
      depositMethod.forEach((method: string) => {
        params.append('depositMethod', method)
      })

    const newQuery: SearchType = {
      applicableObject: values?.applicableObject,
      applicableObjectId: params?.toString(),
      page: 1,
      take: search.take || 10
    }

    setSearch(newQuery as findAllArgs)
  }

  const onCancel = () => {
    setOpen(false)
  }

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              onFinish={onSearch}
              form={form}
              layout='vertical'
            >
              <Row gutter={16}>
                <Col>
                  <Form.Item
                    name='depositMethod'
                    label={trans`policy-management.payment.paymentMethod`}
                  >
                    <CustomPaymentMethod
                      module={pageEnum.accountBankPayment}
                      defaultMethod='search'
                      handleSelectMethod={handleSelectMethod}
                    />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item
                    name='applicableObject'
                    initialValue={APPLICABLE_OBJECTS.ALL}
                    label={trans`policy-management.payment.applicableObject`}
                  >
                    <Select
                      // getPopupContainer={(trigger) => trigger.parentNode}
                      onChange={(value) => {
                        setObject(value)
                        form.resetFields(['accountNumber', 'accountGroup'])
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
                            onClearSearch={onClearSearch}
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
                            onClearSearch={onClearSearch}
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
                    module='withdraw_money'
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
        dataSource={data?.data ?? []}
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
      {open && mode !== viewMode.delete && (
        <AuditLogManagementModal
          page={pageEnum.accountBankPayment}
          onCancel={onCancel}
          open={open}
          mode={mode}
          refetch={refetch}
          recordId={selectedRecord}
          entityType={'SYSTEM_FEE_MANAGEMENT'}
        />
      )}

      {open && mode === viewMode.delete && selectedRecord && (
        <Modal
          title={trans`policy-management.payment.modal.bank-policy-delete-title`}
          open={open}
          onCancel={onCancel}
          centered
          footer={false}
        >
          <DeletePolicyModal
            onCancel={onCancel}
            refetch={refetch}
            policyId={selectedRecord}
          />
        </Modal>
      )}
    </Card>
  )
}

export default AccountAndBankPaymentManagement
