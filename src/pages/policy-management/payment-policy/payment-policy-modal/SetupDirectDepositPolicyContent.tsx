import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonDelete from '@components/button-delete/ButtonDelete'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import CustomPaymentMethod from '@components/custom-payment-method/CustomPaymentMethod'
import {
  APPLICABLE_OBJECTS,
  IPolicyTable,
  pageEnum,
  viewMode
} from '@type/policyManagement'
import { convertNumber, showSuccessMessage } from '@utils/helperFunctions'
import {
  Button,
  Col,
  DatePicker,
  Empty,
  Form,
  Row,
  Select,
  Spin,
  Table,
  Tooltip
} from 'antd'
import { RangePickerProps } from 'antd/es/date-picker'
import { useForm } from 'antd/es/form/Form'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AddAndUpdateFeePackageModal } from '../../policy-management-modal/add-and-update-fee-package-modal/AddAndUpdateFeePackageModal'

import { applicableObjects } from '@constants/options'
import { CustomAccountGroupSelect } from '@pages/policy-management/components/SelectAccountGroup'
import { CustomPrivateAccountSelect } from '@pages/policy-management/components/SelectPrivateAccount'
import { SearchValueType } from '@pages/policy-management/e-wallet-money-transfer/e-wallet-transfer-money-modal/SetupEWalletTransferMoneyContent'
import { useLazyGetListGroupQuery } from '@services/apiAccountGroup'
import {
  useCreateBankPaymentPolicyMutation,
  useUpdateBankPaymentPolicyMutation
} from '@services/apiBankPaymentPolicy'
import {
  useCreateDirectDepositMutation,
  useLazyGetDetailPolicyQuery,
  useUpdateDirectDepositMutation
} from '@services/apiDirectDeposit'
import {
  useCreateWithdrawMutation,
  useUpdateWithdrawMutation
} from '@services/apiWidthdraw'
import { useLazyGetCustomersQuery } from '@services/customerService'
import { STATUS_CODE } from '@type/api'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localeData from 'dayjs/plugin/localeData'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekYear from 'dayjs/plugin/weekYear'
import weekday from 'dayjs/plugin/weekday'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat, TimeFullFormat } from '@constants/datetime'
import moment from 'moment'

dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)

type ModalContentType = {
  module?: pageEnum
  onCancel: () => void
  mode?: viewMode
  refetch?: () => void
  recordId?: number
}

const formItemStyle = {
  labelCol: { span: 5 },
  wrapperCol: { span: 14 }
}

export const SetupDirectDepositPolicyContent = ({
  onCancel,
  module,
  mode,
  refetch,
  recordId
}: ModalContentType) => {
  const { t } = useTranslation()
  const [form] = useForm()

  const endDate = Form.useWatch("endDate")

  const [openAddAndUpdateFeePackage, setOpenAddAndUpdateFeePackage] =
    useState<boolean>(false)
  const [feeMode, setFeeMode] = useState<viewMode>(viewMode.create)
  const [endDateDisable, setEndDateDisable] = useState<any>({})
  const [selectedFeePackageId, setSelectedFeePackageId] = useState<
    string | number
  >('')
  const [object, setObject] = useState<APPLICABLE_OBJECTS>(
    APPLICABLE_OBJECTS.SYSTEM
  )
  const [fee, setFee] = useState<any>()
  const [isError, setIsError] = useState(false)
  const [searchValue, setSearchValue] = useState<SearchValueType>({
    accountGroupSearch: '',
    privateAccountSearch: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const [triggerListAccountGroup, { data: listAccountGroup }] =
    useLazyGetListGroupQuery()
  const [triggerListAccount, { data: listAccount }] = useLazyGetCustomersQuery()
  const [record, setRecord] = useState<IPolicyTable | undefined>()
  const [createDirectDeposit] = useCreateDirectDepositMutation()
  const [updateDirectDeposit] = useUpdateDirectDepositMutation()
  const [getDetailPolicy] = useLazyGetDetailPolicyQuery()
  const [createWithdraw] = useCreateWithdrawMutation()
  const [updateWithdraw] = useUpdateWithdrawMutation()
  const [createBankPaymentPolicy] = useCreateBankPaymentPolicyMutation()
  const [updateBankPaymentPolicy] = useUpdateBankPaymentPolicyMutation()

  const columns: ColumnsType<any> = [
    {
      align: 'center',
      title: t`labels.no`,
      render: (record) => 1
    },
    {
      align: 'center',
      title: t`policy-management.depositManagement.modalContent.tabelModal.transactionFrom`,
      render: (record) => <div>{convertNumber(record.transactionFrom)}</div>
    },
    {
      align: 'center',
      title: t`policy-management.depositManagement.modalContent.tabelModal.transactionTo`,
      render: (record) => <div>{convertNumber(record.transactionTo)}</div>
    },
    {
      title: t`policy-management.depositManagement.modalContent.tabelModal.transactionFee`,
      children: [
        {
          align: 'center',
          title: t`policy-management.depositManagement.modalContent.tabelModal.onTransferor`,
          children: [
            {
              dataIndex: 'transferorFlexibleFee',
              title: t`policy-management.depositManagement.modalContent.tabelModal.variableFee`,
              align: 'center',
              render: (value, record) => (
                <div>{convertNumber(record.type === "FLEXIBLE" ? value : null, '%')}</div>
              )
            },
            {
              dataIndex: 'transferorFixedFee',
              title: t`policy-management.depositManagement.modalContent.tabelModal.fixedFee`,
              align: 'center',
              render: (value, record) => <div>{convertNumber(record.type === "FIXED" ? value : null)}</div>
            },
            {
              dataIndex: 'transferorFeeMin',
              title: t`policy-management.depositManagement.modalContent.tabelModal.minFee`,
              align: 'center',
              render: (value, record) => <div>{convertNumber(record.type === "FLEXIBLE" ? value : null)}</div>
            },
            {
              dataIndex: 'transferorFeeMax',
              title: t`policy-management.depositManagement.modalContent.tabelModal.maxFee`,
              align: 'center',
              render: (value, record) => <div>{convertNumber(record.type === "FLEXIBLE" ? value : null)}</div>
            }
          ]
        },
        {
          align: 'center',
          title: t`policy-management.depositManagement.modalContent.tabelModal.onReceiver`,
          children: [
            {
              dataIndex: 'receiverFlexibleFee',
              title: t`policy-management.depositManagement.modalContent.tabelModal.variableFee`,
              align: 'center',
              render: (value, record) => <div>{convertNumber(record.type === "FLEXIBLE" ? value : null, '%')}</div>
            },
            {
              dataIndex: 'receiverFixedFee',
              title: t`policy-management.depositManagement.modalContent.tabelModal.fixedFee`,
              align: 'center',
              render: (value, record) => <div>{convertNumber(record.type === "FIXED" ? value : null)}</div>
            },
            {
              dataIndex: 'receiverFeeMin',
              title: t`policy-management.depositManagement.modalContent.tabelModal.minFee`,
              align: 'center',
              render: (value, record) => <div>{convertNumber(record.type === "FLEXIBLE" ? value : null)}</div>
            },
            {
              dataIndex: 'receiverFeeMax',
              title: t`policy-management.depositManagement.modalContent.tabelModal.maxFee`,
              align: 'center',
              render: (value, record) => <div>{convertNumber(record.type === "FLEXIBLE" ? value : null)}</div>
            }
          ]
        }
      ]
    },
    {
      align: 'center',
      width: 120,
      title: t`policy-management.depositManagement.action`,
      render: (record) => (
        <Row
          gutter={5}
          justify='center'
        >
          <Col>
            <ButtonUpdate
              module='direct_deposit'
              onClick={() => {
                setFeeMode(viewMode.update)
                setOpenAddAndUpdateFeePackage(true)
                setSelectedFeePackageId(record.id)
              }}
            />
          </Col>
          <Col>
            <Tooltip
              placement='top'
              title={t('admin-management.tooltip.delete')}
            >
              <ButtonDelete
                hidden={mode === viewMode.update}
                module='direct_deposit'
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
  ]

  const fetchData = async () => {
    if (mode !== viewMode.update || !recordId) {
      return
    }

    setIsLoading(true)

    const { data } = await getDetailPolicy(recordId)

    if (!data || !data.id) {
      setIsLoading(false)
      return
    }

    const {
      applicableObject,
      createdAt,
      startDate,
      depositMethod,
      endDate,
      id,
      updatedAt,
      applicableObjectId,
      applicableObjectName,
      depositMethods,
      ...rest
    } = data

    setRecord(data)
    setFee(rest)
    setObject(applicableObject as APPLICABLE_OBJECTS)

    if (
      applicableObjectName &&
      applicableObject === APPLICABLE_OBJECTS.ACCOUNT_GROUP
    ) {
      form.setFieldValue('accountGroup', {
        value: applicableObjectId,
        label: applicableObjectName
      })
    }

    if (
      applicableObject === APPLICABLE_OBJECTS.PERSONAL_ACCOUNT &&
      applicableObjectName
    ) {
      form.setFieldValue('accountNumber', {
        value: applicableObjectId,
        label: applicableObjectName
      })
    }

    if (data) {
      form.setFieldsValue({
        ...data,
        depositMethod: data.depositMethodIds,
        startDate: startDate && dayjs(startDate),
        endDate: endDate && dayjs(endDate)
      })
    }

    setIsLoading(false)
  }

  const getTitle = useCallback(() => {
    switch (module) {
      case pageEnum.accountBankPayment:
        return t`policy-management.payment.paymentMethod`
      case pageEnum.withdrawMoney:
        return t`policy-management.payment.withDrawBank`
      case pageEnum.directDeposit:
        return t`policy-management.payment.depositMethod`
    }
  }, [module])

  const getError = useCallback(() => {
    switch (module) {
      case pageEnum.accountBankPayment:
        return t`policy-management.depositManagement.validateMethodRequired`.toString()
      case pageEnum.withdrawMoney:
        return t`policy-management.depositManagement.validateWBankRequired`.toString()
      case pageEnum.directDeposit:
        return t`policy-management.depositManagement.validateDBankRequired`.toString()
    }
  }, [module])

  useEffect(() => {
    fetchData()
    setEndDateDisable(dayjs(dayjs().startOf('day').toISOString()))
  }, [])

  const toggleFee = (value: any[], type: viewMode) => {
    if ((type === viewMode.create || type === viewMode.update) && value) {
      setFee(value)
    } else {
      setFee(undefined)
    }
    setIsError(false)
  }

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < dayjs().startOf('day')
  }

  const onChangeStartDate = (date: any, dateString: string) => {
    setEndDateDisable(date)
  }

  const disabledEndDate: RangePickerProps['disabledDate'] = useCallback(
    (current: any) => {
      const startDate = form.getFieldValue('startDate')
      return (
        (dayjs(endDateDisable.toISOString()) &&
          current < dayjs(endDateDisable.toISOString())) ||
        current < dayjs(startDate)
      )
    },
    [endDateDisable]
  )

  const onCancelFeePackageModal = () => {
    setOpenAddAndUpdateFeePackage(false)
  }

  const handleSelectMethod = (values: number[] | string, status?: string) => {
    //if (typeof status === 'string') {
    //form.setFieldsValue({
    //depositMethod: undefined
    //})
    //return
    //}

    form.setFieldsValue({
      depositMethod: values
    })
  }

  const onSubmit = async (values: any) => {
    if (!fee) {
      setIsError(true)
      return
    }

    setIsLoading(true)

    const { endDate, startDate, depositMethod, applicableObject } = values
    const timeEnd = endDate ? dayjs(endDate).toISOString() : undefined
    const timeStart = dayjs(startDate).toISOString()
    const objectIds =
      applicableObject === APPLICABLE_OBJECTS.ACCOUNT_GROUP
        ? values.accountGroup?.value
        : applicableObject === APPLICABLE_OBJECTS.PERSONAL_ACCOUNT
          ? values.accountNumber?.value
          : undefined

    const data = {
      ...values,
      depositMethod,
      startDate: timeStart,
      endDate: timeEnd,
      applicableObjectId: objectIds,
      ...fee
    }
    let valueTypeUpdate: string[] = []
    if (viewMode.update && record) {
      if (data.endDate === undefined) data.endDate = null
      Object.keys(record).forEach((value) => {
        console.log("new change check - ", value, data[value], record[value as keyof IPolicyTable])
        if (
          ['endDate', 'startDate', 'transactionFrom', 'transactionTo', 'transferorFlexibleFee', 'transferorFixedFee', 'transferorFeeMin', 'transferorFeeMax'].includes(
            value
          ) &&
          data[value] != record[value as keyof IPolicyTable]
        ) {
          console.log("new change - ", value, data[value], record[value as keyof IPolicyTable])
          valueTypeUpdate.push(value)
        }
      })
      data.valueTypeUpdate = valueTypeUpdate
    }
    data.valueTypeDelete = []
    switch (module) {
      case pageEnum.directDeposit:
        if (mode === viewMode.create) {
          createDirectDeposit(data)
            .unwrap()
            .then(() => {
              showSuccessMessage(
                t`policy-management.payment.messages.create-success`
              )
              onCancel()
              form.resetFields()
              refetch?.()
            })
            .finally(() => {
              setIsLoading(false)
            })
        } else {
          updateDirectDeposit({ id: record?.id, data })
            .unwrap()
            .then(() => {
              showSuccessMessage(
                t`policy-management.payment.messages.edit-success`
              )
              onCancel()
              form.resetFields()
              refetch?.()
            })
            .finally(() => {
              setIsLoading(false)
            })
        }
        break
      case pageEnum.withdrawMoney:
        if (mode === viewMode.create) {
          createWithdraw(data)
            .unwrap()
            .then(() => {
              showSuccessMessage(
                t`policy-management.payment.messages.create-success`
              )
              onCancel()
              form.resetFields()
              refetch?.()
            })
            .finally(() => {
              setIsLoading(false)
            })
        } else {
          updateWithdraw({ id: record?.id, data })
            .unwrap()
            .then(() => {
              showSuccessMessage(
                t`policy-management.payment.messages.edit-success`
              )
              onCancel()
              form.resetFields()
              refetch?.()
            })
            .finally(() => {
              setIsLoading(false)
            })
        }
        break
      case pageEnum.accountBankPayment:
        if (mode === viewMode.create) {
          createBankPaymentPolicy(data)
            .unwrap()
            .then(() => {
              showSuccessMessage(
                t`policy-management.payment.messages.create-success`
              )
              onCancel()
              form.resetFields()
              refetch?.()
            })
            .finally(() => {
              setIsLoading(false)
            })
        } else {
          updateBankPaymentPolicy({ id: record?.id, data })
            .unwrap()
            .then(() => {
              showSuccessMessage(
                t`policy-management.payment.messages.edit-success`
              )
              onCancel()
              form.resetFields()
              refetch?.()
            })
            .finally(() => {
              setIsLoading(false)
            })
        }
        break
    }
  }

  return (
    <Spin spinning={isLoading}>
      <Form
        onFinish={onSubmit}
        form={form}
      >
        <Row gutter={GUTTER}>
          <Col span={24}>
            <Form.Item
              name='applicableObject'
              label={t`policy-management.payment.applicableObject`}
              {...formItemStyle}
              labelAlign='left'
              initialValue={APPLICABLE_OBJECTS.SYSTEM}
              rules={[
                {
                  required: true,
                  message:
                    t`policy-management.depositManagement.validateSystemRequired`.toString()
                }
              ]}
            >
              <Select
                onChange={(value) => setObject(value)}
                style={{ minWidth: 220 }}
                disabled={mode === viewMode.update}
                options={applicableObjects}
              />
            </Form.Item>
            {[
              APPLICABLE_OBJECTS.PERSONAL_ACCOUNT,
              APPLICABLE_OBJECTS.ACCOUNT_GROUP
            ].includes(object) && (
                <>
                  {object === APPLICABLE_OBJECTS.ACCOUNT_GROUP ? (
                    <Form.Item
                      name='accountGroup'
                      {...formItemStyle}
                      labelAlign='left'
                      label={t`policy-management.payment.selectAccountGroup`}
                      rules={[
                        {
                          required: true,
                          message:
                            t`policy-management.depositManagement.validateAccountGroupRequired`.toString()
                        }
                      ]}
                    >
                      <CustomAccountGroupSelect
                        disabled={mode === viewMode.update}
                        listAccountGroup={listAccountGroup}
                        setSearchValue={setSearchValue}
                        searchInput={searchValue}
                        placeholder={t`policy-management.eWalletTransferMoneyManagement.placeholders.accountGroup`.toString()}
                        triggerFunction={triggerListAccountGroup}
                      />
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
                            t`policy-management.depositManagement.validateAccountRequired`.toString()
                        }
                      ]}
                    >
                      <CustomPrivateAccountSelect
                        disabled={mode === viewMode.update}
                        listAccount={listAccount}
                        setSearchValue={setSearchValue}
                        searchInput={searchValue}
                        placeholder={t`policy-management.payment.accountNumberPlaceholder`.toString()}
                        triggerFunction={triggerListAccount}
                      />
                    </Form.Item>
                  )}
                </>
              )}
            <Form.Item
              rules={[
                {
                  required: true,
                  message: getError()
                }
              ]}
              name='depositMethod'
              label={getTitle()}
              {...formItemStyle}
              labelAlign='left'
            >
              <CustomPaymentMethod
                module={module}
                defaultMethod='configure'
                mode={mode}
                handleSelectMethod={handleSelectMethod}
                defaultSelected={record?.depositMethodIds}
              />
            </Form.Item>
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
            <div>{t`policy-management.depositManagement.modalContent.packagePackage`}</div>
            {!fee && (
              <ButtonAdd
                module='direct_deposit'
                label={t`policy-management.depositManagement.modalContent.createNewFeePackage`.toString()}
                onClick={() => {
                  setOpenAddAndUpdateFeePackage(true)
                  setFeeMode(viewMode.create)
                }}
              />
            )}
          </div>
          <Table
            bordered
            dataSource={fee ? [fee] : []}
            columns={columns}
            scroll={{ x: '100%' }}
            pagination={false}
            locale={{
              emptyText: <Empty description={t`labels.table-nodata`} />
            }}
          />
          {isError && (
            <span
              style={{ color: '#ff4d4f' }}
            >{t`policy-management.payment.messages.fee-required`}</span>
          )}
        </Row>
        <Row gutter={GUTTER}>
          <Col span={24}>
            <Form.Item
              name='startDate'
              label={t`policy-management.depositManagement.applicableTimeStart`}
              {...formItemStyle}
              labelAlign='left'
              rules={[
                {
                  required: true,
                  message:
                    t`policy-management.depositManagement.validateRequired`.toString()
                }
              ]}
              initialValue={dayjs().startOf('day')}
            >
              <DatePicker
                showTime
                use12Hours={false}
                disabledDate={disabledDate}
                className='w-100'
                format='DD/MM/YYYY HH:mm:ss'
                onChange={onChangeStartDate}
                showNow={false}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name='endDate'
              label={t`policy-management.depositManagement.applicableTimeEnd`}
              {...formItemStyle}
              labelAlign='left'
            >
              <DatePicker
                showTime={{ defaultValue: dayjs('23:59:59', 'HH:mm:ss') }}
                showNow={false}
                disabledDate={disabledEndDate}
                className='w-100'
                format='DD/MM/YYYY HH:mm:ss'
                placeholder={t`policy-management.depositManagement.modalContent.endDatePlaceholder`.toString()}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row
          className='justify-end'
          gutter={GUTTER}
        >
          <Col>
            <Button
              onClick={() => {
                onCancel()
              }}
            >{t`buttons.back`}</Button>
          </Col>
          <Col>
            <Button
              loading={isLoading}
              type='primary'
              htmlType='submit'
            >
              {mode === viewMode.create
                ? t`policy-management.payment.establish`
                : t`buttons.update`}
            </Button>
          </Col>
        </Row>
        {openAddAndUpdateFeePackage && (
          <AddAndUpdateFeePackageModal
            policyMode={mode}
            id={selectedFeePackageId}
            open={openAddAndUpdateFeePackage}
            mode={feeMode}
            onCancel={onCancelFeePackageModal}
            toggleFee={toggleFee}
            module={module}
            fee={fee}
          />
        )}
      </Form>
    </Spin>
  )
}
