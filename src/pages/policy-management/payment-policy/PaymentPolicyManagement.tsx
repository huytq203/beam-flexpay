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
import { SearchOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/es/table'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'antd/es/form/Form'
import { PolicyManagementModal } from '../policy-management-modal/PolicyManagementModal'
import {
  APPLICABLE_OBJECTS,
  objects,
  pageEnum,
  viewMode
} from '@type/policyManagement'
import ButtonAdd from '@components/button-add/ButtonAdd'
import CustomPaymentMethod from '@components/custom-payment-method/CustomPaymentMethod'
import { useGetListDirectDepositQuery } from '@services/apiDirectDeposit'
import { BsEyeFill } from 'react-icons/bs'
import ButtonDelete from '@components/button-delete/ButtonDelete'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import { convertNumber, getApplicableObject } from '@utils/helperFunctions'
import CellContent from '@components/cell-content/CellContent'
import dayjs from 'dayjs'
import { DeletePolicyModal } from '../policy-management-modal/delete-modal/DeletePolicyModal'
import { CustomAccountGroupSelect } from '../components/SelectAccountGroup'
import { useLazyGetListGroupQuery } from '@services/apiAccountGroup'
import { SearchValueType } from '../e-wallet-money-transfer/e-wallet-transfer-money-modal/SetupEWalletTransferMoneyContent'
import { CustomPrivateAccountSelect } from '../components/SelectPrivateAccount'
import { useLazyGetCustomersQuery } from '@services/customerService'
import SearchBar from '@components/search-bar/SearchBar'
import { TimeFullFormat } from '@constants/datetime'

type SearchType = {
  page: number
  take: number
  accountGroup?: string
  depositMethod?: string[]
  applicableObject?: string
  applicableObjectId?: string[] | number[] | any
}

const PaymentPolicyManagement = () => {
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
  const [selectedRecord, setSelectedRecord] = useState<number | undefined>(
    undefined
  )

  const { data, refetch } = useGetListDirectDepositQuery(search)
  const [triggerListAccountGroup, { data: listAccountGroup }] =
    useLazyGetListGroupQuery()
  const [triggerListAccount, { data: listAccount }] = useLazyGetCustomersQuery()

  const columns: ColumnsType<any> = [
    {
      align: 'center',
      title: trans`policy-management.eWalletTransferMoneyManagement.order`,
      dataIndex: 'id',
      width: 80,
      fixed: 'left',
      render: (text, object, index) => (
        <div>{((data?.meta?.page as number) - 1) * 10 + index + 1}</div>
      )
    },
    {
      align: 'center',
      title: trans`policy-management.payment.applicableObject`,
      dataIndex: 'applicableObject',
      width: 120,
      fixed: 'left',
      render: (record) => <CellContent data={getApplicableObject(record)} />
    },
    {
      align: 'center',
      title: `${trans`policy-management.common.depositMethod`}`,
      dataIndex: 'depositMethods',
      width: 200,
      fixed: 'left',
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
              render: (record) => <div>{convertNumber(record)}</div>
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
        <div>{record ? dayjs(record).format(TimeFullFormat) : '-'}</div>
      )
    },
    {
      align: 'center',
      title: `${trans`policy-management.payment.endDate`}`,
      dataIndex: 'endDate',
      width: 150,
      render: (record) => (
        <div>{record ? dayjs(record).format(TimeFullFormat) : '-'}</div>
      )
    },
    {
      align: 'center',
      width: 120,
      title: `${trans`policy-management.payment.policyHistory`}`,
      fixed: 'right',
      render: (record) => (
        <Tooltip title={trans`buttons.history`}>
          <Button
            icon={<BsEyeFill />}
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
      title: `${trans`policy-management.payment.edit`}`,
      align: 'center',
      width: 80,
      fixed: 'right',
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
      title: `${trans`policy-management.payment.cancel`}`,
      align: 'center',
      width: 80,
      fixed: 'right',
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
  ]

  const onCancel = () => {
    setOpen(false)
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

  const onClearSearch = (field: string) => {
    const newSearch = {
      ...search,
      page: 1,
      [field]: undefined
    }
    setSearch(newSearch)
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
      take: search.take
    }

    setSearch(newQuery)
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
                    label={trans`policy-management.common.depositMethod`}
                  >
                    <CustomPaymentMethod
                      module={pageEnum.directDeposit}
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
                      onChange={(value) => {
                        setObject(value)
                        form.resetFields(['accountNumber', 'accountGroup'])
                      }}
                      style={{ minWidth: 190 }}
                      options={objects}
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
                    module='direct_deposit'
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
        <PolicyManagementModal
          page={pageEnum.directDeposit}
          onCancel={onCancel}
          open={open}
          mode={mode}
          refetch={refetch}
          recordId={selectedRecord}
        />
      )}

      {open && mode === viewMode.delete && selectedRecord && (
        <Modal
          title={trans`policy-management.payment.modal.delete-title`}
          open={open}
          maskClosable={false}
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

export default PaymentPolicyManagement