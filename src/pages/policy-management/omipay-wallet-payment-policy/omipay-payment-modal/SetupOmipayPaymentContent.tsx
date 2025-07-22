import {
  Button,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Table,
  Tooltip,
  TreeSelect
} from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'antd/es/form/Form'
import ButtonAdd from '@components/button-add/ButtonAdd'
import { ColumnsType } from 'antd/es/table'
import { viewMode } from '@type/policyManagement'
import dayjs from 'dayjs'
import ButtonDelete from '@components/button-delete/ButtonDelete'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import { RangePickerProps } from 'antd/es/date-picker'
import { convertNumber } from '@utils/helperFunctions'
import { AddAndUpdateFeePackageModal } from '@pages/policy-management/policy-management-modal/add-and-update-fee-package-modal/AddAndUpdateFeePackageModal'
import { GUTTER } from '@constants/appConstant'

type SearchType = {
  page: number
  take: number
}

type ModalContentType = {
  onCancel: () => void
}

const x = Array.from({ length: 50 }, (_, i) => ({
  title: `Phương thức ${i + 1}`,
  value: `${i + 1}`
}))

const allIds = x.map(({ value }) => value)

const DummyTable = [
  {
    id: 1,
    transactionFrom: '100000',
    transactionTo: '100000',
    transactor: {
      variableFee: '1041200',
      fixedFee: '5550000',
      minFee: '124100',
      maxFee: '10000151'
    },
    receiver: {
      variableFee: '1002131000',
      fixedFee: '101230000',
      minFee: '1515200000',
      maxFee: '10142140000'
    }
  }
]

const formItemStyle = {
  labelCol: { span: 5 },
  wrapperCol: { span: 14 }
}

export const SetupOmipayPaymentContent = ({ onCancel }: ModalContentType) => {
  const { t } = useTranslation()
  const [form] = useForm()

  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [search, setSearch] = useState<SearchType>({ page: 1, take: 10 })
  const [openAddAndUpdateFeePackage, setOpenAddAndUpdateFeePackage] =
    useState<boolean>(false)
  const [feeMode, setFeeMode] = useState<viewMode>(viewMode.create)
  const [endDateDisable, setEndDateDisable] = useState<any>({})
  const [selectedFeePackageId, setSelectedFeePackageId] = useState<
    string | number
  >('')
  const [object, setObject] = useState(1)

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < dayjs().startOf('day')
  }

  const onChangeStartDate = (date: any, dateString: string) => {
    setEndDateDisable(date)
  }

  const disabledEndDate: RangePickerProps['disabledDate'] = (current) => {
    return (
      dayjs(endDateDisable.toISOString()) &&
      current < dayjs(endDateDisable.toISOString())
    )
  }

  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        key: 'transactionFrom',
        align: 'center',
        title: t`policy-management.omipayPaymentManagement.modalContent.tableModal.transactionFrom`,
        render: (record) => <div>{convertNumber(record.transactionFrom)}</div>
      },
      {
        key: 'transactionTo',
        align: 'center',
        title: t`policy-management.omipayPaymentManagement.modalContent.tableModal.transactionTo`,
        render: (record) => <div>{convertNumber(record.transactionTo)}</div>
      },
      {
        key: 'transactor',
        align: 'center',
        title: t`policy-management.omipayPaymentManagement.modalContent.tableModal.onTransferor`,
        children: [
          {
            dataIndex: 'transactor',
            key: 'variableFeeTransactor',
            title: t`policy-management.omipayPaymentManagement.modalContent.tableModal.variableFee`,
            align: 'center',
            render: (record) => <div>{convertNumber(record.variableFee)}</div>
          },
          {
            dataIndex: 'transactor',
            key: 'fixedFeeTransactor',
            title: t`policy-management.omipayPaymentManagement.modalContent.tableModal.fixedFee`,
            align: 'center',
            render: (record) => <div>{convertNumber(record.fixedFee)}</div>
          },
          {
            dataIndex: 'transactor',
            key: 'minFeeTransactor',
            title: t`policy-management.omipayPaymentManagement.modalContent.tableModal.minFee`,
            align: 'center',
            render: (record) => <div>{convertNumber(record.minFee)}</div>
          },
          {
            dataIndex: 'transactor',
            key: 'maxFeeTransactor',
            title: t`policy-management.omipayPaymentManagement.modalContent.tableModal.maxFee`,
            align: 'center',
            render: (record) => <div>{convertNumber(record.maxFee)}</div>
          }
        ]
      },
      {
        key: 'receiver',
        align: 'center',
        title: t`policy-management.omipayPaymentManagement.modalContent.tableModal.onReceiver`,
        children: [
          {
            dataIndex: 'receiver',
            key: 'variableFeeReceiver',
            title: t`policy-management.omipayPaymentManagement.modalContent.tableModal.variableFee`,
            align: 'center',
            render: (record) => <div>{convertNumber(record.variableFee)}</div>
          },
          {
            dataIndex: 'receiver',
            key: 'fixedFeeReceiver',
            title: t`policy-management.omipayPaymentManagement.modalContent.tableModal.fixedFee`,
            align: 'center',
            render: (record) => <div>{convertNumber(record.fixedFee)}</div>
          },
          {
            dataIndex: 'receiver',
            key: 'minFeeReceiver',
            title: t`policy-management.omipayPaymentManagement.modalContent.tableModal.minFee`,
            align: 'center',
            render: (record) => <div>{convertNumber(record.minFee)}</div>
          },
          {
            dataIndex: 'receiver',
            key: 'maxFeeReceiver',
            title: t`policy-management.omipayPaymentManagement.modalContent.tableModal.maxFee`,
            align: 'center',
            render: (record) => <div>{convertNumber(record.maxFee)}</div>
          }
        ]
      },
      {
        align: 'center',
        width: 120,
        title: t`policy-management.omipayPaymentManagement.action`,
        render: (record) => (
          <Row
            gutter={5}
            justify='center'
          >
            <Col>
              <Tooltip
                placement='top'
                title={t('admin-management.tooltip.view')}
              >
                <ButtonUpdate
                  module='wallet_payment'
                  onClick={() => {
                    setFeeMode(viewMode.update)
                    setOpenAddAndUpdateFeePackage(true)
                    setSelectedFeePackageId(record.id)
                  }}
                />
              </Tooltip>
            </Col>
            <Col>
              <Tooltip
                placement='top'
                title={t('admin-management.tooltip.delete')}
              >
                <ButtonDelete
                  module='wallet_payment'
                  onClick={() => {
                    setFeeMode(viewMode.delete)
                    setOpenAddAndUpdateFeePackage(true)
                  }}
                />
              </Tooltip>
            </Col>
          </Row>
        )
      }
    ],
    []
  )

  const objects = useMemo(
    () => [
      {
        value: 1,
        name: t`policy-management.payment.system`
      },
      {
        value: 2,
        name: t`policy-management.payment.personalAccount`
      },
      {
        value: 3,
        name: t`policy-management.payment.businessAccount`
      },
      {
        value: 4,
        name: t`policy-management.payment.majorAccount`
      },
      {
        value: 5,
        name: t`policy-management.payment.accountGroup`
      },
      {
        value: 6,
        name: t`policy-management.payment.personal`
      }
    ],
    []
  )

  const applicableObject = useMemo(
    () => [
      {
        value: 1,
        name: t`policy-management.depositManagement.normal`
      },
      {
        value: 2,
        name: t`policy-management.depositManagement.event`
      }
    ],
    []
  )

  const onCancelFeePackageModal = () => {
    setOpenAddAndUpdateFeePackage(false)
  }

  useEffect(() => {
    setSelectedValues(allIds)
    setEndDateDisable(dayjs(dayjs().add(1, 'day').startOf('day').toISOString()))
    form.setFieldsValue({
      depositMethod: allIds
    })
  }, [])

  const onSubmit = (values: any) => {}

  return (
    <>
      <div style={{ padding: '10px' }}>
        <Form
          onFinish={onSubmit}
          form={form}
        >
          <Row gutter={GUTTER}>
            <Col span={24}>
              <Form.Item
                name='object'
                label={t`policy-management.payment.applicableObject`}
                {...formItemStyle}
                labelAlign='left'
                initialValue={1}
                rules={[
                  {
                    required: true,
                    message:
                      t`policy-management.eWalletTransferMoneyManagement.validateRequired`.toString()
                  }
                ]}
              >
                <Select
                  onChange={(value) => setObject(value)}
                  style={{ minWidth: 220 }}
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
              {[5, 6].includes(object) && (
                <>
                  {object === 5 ? (
                    <Form.Item
                      name='accountGroup'
                      {...formItemStyle}
                      labelAlign='left'
                      label={t`policy-management.payment.selectAccountGroup`}
                      initialValue={1}
                      rules={[
                        {
                          required: true,
                          message:
                            t`policy-management.eWalletTransferMoneyManagement.validateRequired`.toString()
                        }
                      ]}
                    >
                      <Select style={{ minWidth: 220 }}>
                        <Select.Option
                          value={'all'}
                        >{t`policy-management.payment.all`}</Select.Option>
                      </Select>
                    </Form.Item>
                  ) : (
                    <Form.Item
                      {...formItemStyle}
                      labelAlign='left'
                      name='accountNumber'
                      label={t`policy-management.payment.inputAccount`}
                      rules={[
                        {
                          required: true,
                          message:
                            t`policy-management.eWalletTransferMoneyManagement.validateRequired`.toString()
                        }
                      ]}
                    >
                      <Input
                        placeholder={t`policy-management.payment.accountNumberPlaceholder`.toString()}
                      />
                    </Form.Item>
                  )}
                </>
              )}
            </Col>
          </Row>
          <Row
            style={{ marginBottom: '20px' }}
            gutter={GUTTER}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
                marginBottom: '18px'
              }}
            >
              <div>{t`policy-management.omipayPaymentManagement.modalContent.packagePackage`}</div>
              <ButtonAdd
                module='wallet_payment'
                label={t`policy-management.eWalletTransferMoneyManagement.modalContent.createNewFeePackage`.toString()}
                onClick={() => {
                  setOpenAddAndUpdateFeePackage(true)
                  setFeeMode(viewMode.create)
                }}
              />
            </div>
            <Table
              bordered
              dataSource={DummyTable}
              columns={columns}
              scroll={{ x: '100%' }}
              pagination={false}
              locale={{
                emptyText: <Empty description={t`labels.table-nodata`} />
              }}
            />
          </Row>
          <Row gutter={GUTTER}>
            <Col span={24}>
              <Form.Item
                name='applicableTimeStart'
                label={t`policy-management.eWalletTransferMoneyManagement.applicableTimeStart`}
                {...formItemStyle}
                labelAlign='left'
                initialValue={dayjs(dayjs().startOf('day').toISOString())}
                rules={[
                  {
                    required: true,
                    message:
                      t`policy-management.eWalletTransferMoneyManagement.validateRequired`.toString()
                  }
                ]}
              >
                <DatePicker
                  disabledDate={disabledDate}
                  showTime
                  className='w-100'
                  format='HH:MM:ss DD/MM/YYYY'
                  onChange={onChangeStartDate}
                  showNow={false}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name='applicableTimeEnd'
                label={t`policy-management.eWalletTransferMoneyManagement.applicableTimeEnd`}
                {...formItemStyle}
                labelAlign='left'
              >
                <DatePicker
                  showTime
                  showNow={false}
                  disabledDate={disabledEndDate}
                  className='w-100'
                  format='hh:mm:ss DD/MM/YYYY'
                />
              </Form.Item>
            </Col>
          </Row>
          <Row className='justify-end'>
            <Col>
              <Button
                className='mr-10'
                onClick={onCancel}
              >{t`buttons.cancel`}</Button>
              <Button
                // loading={isLoading}
                type='primary'
                htmlType='submit'
              >{t`policy-management.payment.establish`}</Button>
            </Col>
          </Row>
          <AddAndUpdateFeePackageModal
            id={selectedFeePackageId}
            open={openAddAndUpdateFeePackage}
            mode={feeMode}
            onCancel={onCancelFeePackageModal}
          />
        </Form>
      </div>
    </>
  )
}
