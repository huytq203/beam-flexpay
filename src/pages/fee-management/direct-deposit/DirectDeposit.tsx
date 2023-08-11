import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonDelete from '@components/button-delete/ButtonDelete'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import CellContent from '@components/cell-content/CellContent'
import CustomPaymentMethod from '@components/custom-payment-method/CustomPaymentMethod'
import CustomSelect from '@components/custom-select/CustomSelect'
import SearchBar from '@components/search-bar/SearchBar'
import Table from '@components/table/Table'
import { TimeFullFormat } from '@constants/datetime'
import {
  useLazyCustomerFindAllQuery,
  useLazyGroupFindAllQuery,
  useSystemFeeManagementGetDirectDepositListQuery
} from '@services/cmsService'
import {
  SystemFeeManagementDto,
  SystemFeeManagementGetDirectDepositListApiArg
} from '@type/application'
import { APPLICABLE_OBJECTS, objects, pageEnum } from '@type/policyManagement'
import { convertNumber, getApplicableObject } from '@utils/helperFunctions'
import { useToggle } from 'ahooks'
import { Button, Card, Col, Form, Row, Select, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BsEyeFill } from 'react-icons/bs'
import DirectDepositSetupModal from './DirectDepositSetupModal'

const DirectDeposit = () => {
  const { t } = useTranslation()
  const form = Form.useFormInstance()
  const [open, { toggle }] = useToggle(false)

  // #region search
  const [search, setSearch] =
    useState<SystemFeeManagementGetDirectDepositListApiArg>({
      page: 1,
      take: 10
    })

  const { data: directDeposit } =
    useSystemFeeManagementGetDirectDepositListQuery(search)

  const [object, setObject] = useState<APPLICABLE_OBJECTS>(
    APPLICABLE_OBJECTS.SYSTEM
  )

  const onSearch = (values: SystemFeeManagementGetDirectDepositListApiArg) => {
    setSearch({
      ...search,
      ...values
    })
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

  const [fnFindGroup] = useLazyGroupFindAllQuery()
  const [fnFindCustomer] = useLazyCustomerFindAllQuery()
  // #endregion

  // #region table
  const columns: ColumnsType<SystemFeeManagementDto> = [
    {
      align: 'center',
      title: t`policy-management.eWalletTransferMoneyManagement.order`,
      dataIndex: 'id',
      width: 80,
      fixed: 'left',
      render: (text, object, index) => (
        <div>
          {((directDeposit?.meta?.page as number) - 1) * 10 + index + 1}
        </div>
      )
    },
    {
      align: 'center',
      title: t`policy-management.payment.applicableObject`,
      dataIndex: 'applicableObject',
      width: 120,
      fixed: 'left',
      render: (record) => <CellContent data={getApplicableObject(record)} />
    },
    {
      align: 'center',
      title: `${t`policy-management.common.depositMethod`}`,
      dataIndex: 'depositMethods',
      width: 200,
      fixed: 'left',
      render: (record) => <CellContent data={record} />
    },
    {
      align: 'center',
      title: `${t`policy-management.payment.transactionLevelFrom`} (VNĐ)`,
      dataIndex: 'transactionFrom',
      width: 100,
      render: (record) => <div>{convertNumber(record)}</div>
    },
    {
      align: 'center',
      title: `${t`policy-management.payment.transactionLevelTo`} (VNĐ)`,
      dataIndex: 'transactionTo',
      width: 100,
      render: (record) => <div>{convertNumber(record)}</div>
    },
    {
      align: 'center',
      title: t`policy-management.payment.transactionFee`,
      children: [
        {
          align: 'center',
          title: t`policy-management.payment.onTransactor`,
          children: [
            {
              title: `${t`policy-management.payment.flexibleFee`} (%)`,
              align: 'center',
              width: 100,
              dataIndex: 'transferorFlexibleFee',
              render: (record) => <div>{convertNumber(record)}%</div>
            },
            {
              title: `${t`policy-management.payment.fixedCharge`} (VNĐ)`,
              align: 'center',
              width: 100,
              dataIndex: 'transferorFixedFee',
              render: (record) => <div>{convertNumber(record)}</div>
            },
            {
              title: `${t`policy-management.payment.minFee`} (VNĐ)`,
              align: 'center',
              dataIndex: 'transferorFeeMin',
              width: 100,
              render: (record) => <div>{convertNumber(record)}</div>
            },
            {
              title: `${t`policy-management.payment.maxFee`} (VNĐ)`,
              align: 'center',
              dataIndex: 'transferorFeeMax',
              width: 100,
              render: (record) => <div>{convertNumber(record)}</div>
            }
          ]
        },
        {
          align: 'center',
          title: t`policy-management.payment.onReceiver`,
          children: [
            {
              title: `${t`policy-management.payment.flexibleFee`} (%)`,
              align: 'center',
              width: 100,
              dataIndex: 'receiverFlexibleFee',
              render: (record) => <div>{convertNumber(record)}</div>
            },
            {
              title: `${t`policy-management.payment.fixedCharge`} (VNĐ)`,
              align: 'center',
              width: 100,
              dataIndex: 'receiverFixedFee',
              render: (record) => <div>{convertNumber(record)}</div>
            },
            {
              title: `${t`policy-management.payment.minFee`} (VNĐ)`,
              align: 'center',
              width: 100,
              dataIndex: 'receiverFeeMin',
              render: (record) => <div>{convertNumber(record)}</div>
            },
            {
              title: `${t`policy-management.payment.maxFee`} (VNĐ)`,
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
      title: `${t`policy-management.payment.applicableDate`}`,
      dataIndex: 'startDate',
      width: 150,
      render: (record) => (
        <div>{record ? dayjs(record).format(TimeFullFormat) : '-'}</div>
      )
    },
    {
      align: 'center',
      title: `${t`policy-management.payment.endDate`}`,
      dataIndex: 'endDate',
      width: 150,
      render: (record) => (
        <div>{record ? dayjs(record).format(TimeFullFormat) : '-'}</div>
      )
    },
    {
      align: 'center',
      width: 120,
      title: `${t`policy-management.payment.policyHistory`}`,
      fixed: 'right',
      render: (record) => (
        <Tooltip title={t`buttons.history`}>
          <Button
            icon={<BsEyeFill />}
            onClick={() => {
              // setMode(viewMode.history)
              // setSelectedRecord(record.id)
              // setOpen(true)
            }}
          />
        </Tooltip>
      )
    },
    {
      title: `${t`policy-management.payment.edit`}`,
      align: 'center',
      width: 80,
      fixed: 'right',
      render: (record) => (
        <Tooltip title={t`buttons.update`}>
          <ButtonUpdate
            module=''
            onClick={() => {
              // setMode(viewMode.update)
              // setSelectedRecord(record.id)
              // setOpen(true)
            }}
          />
        </Tooltip>
      )
    },
    {
      title: `${t`policy-management.payment.cancel`}`,
      align: 'center',
      width: 80,
      fixed: 'right',
      render: (record) => (
        <Tooltip title={t`buttons.delete`}>
          <ButtonDelete
            module=''
            onClick={() => {
              // setMode(viewMode.delete)
              // setSelectedRecord(record.id)
              // setOpen(true)
            }}
          />
        </Tooltip>
      )
    }
  ]
  // #endregion

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
                    label={t`policy-management.common.depositMethod`}
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
                    initialValue={APPLICABLE_OBJECTS.SYSTEM}
                    label={t`policy-management.payment.applicableObject`}
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
                        name='applicableObjectId'
                        label={t`policy-management.payment.selectAccountGroup`}
                      >
                        <CustomSelect
                          style={{ minWidth: 350 }}
                          mode='multiple'
                          search={{ page: 1, take: 10 }}
                          trigger={fnFindGroup}
                          field='name'
                        />
                      </Form.Item>
                    ) : (
                      <Form.Item
                        name='applicableObjectId'
                        label={t`policy-management.payment.inputAccount`}
                      >
                        <CustomSelect
                          style={{ minWidth: 350 }}
                          mode='multiple'
                          trigger={fnFindCustomer}
                          search={{
                            page: 1,
                            take: 10
                          }}
                          field='phoneNumber'
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
                  <ButtonSearch htmlType='submit' />
                </Col>
                <Col>
                  <ButtonAdd
                    module='direct_deposit'
                    type='primary'
                    onClick={toggle}
                    label={t`policy-management.payment.establish`.toString()}
                  />
                </Col>
              </Row>
            </Form>
          }
        />
      }
    >
      <Table
        dataSource={directDeposit?.data || []}
        columns={columns}
        pagination={{
          current: directDeposit?.meta?.page || 1,
          pageSize: directDeposit?.meta?.take || 10,
          total: directDeposit?.meta?.itemCount || 0,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <DirectDepositSetupModal
        open={open}
        close={toggle}
      />
    </Card>
  )
}
export default DirectDeposit
