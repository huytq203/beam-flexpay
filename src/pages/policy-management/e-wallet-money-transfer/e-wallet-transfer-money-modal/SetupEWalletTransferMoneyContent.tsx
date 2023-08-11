import {
  Button,
  Col,
  DatePicker,
  Empty,
  Form,
  message,
  notification,
  Row,
  Select,
  Spin,
  Table,
  Tooltip
} from 'antd'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'antd/es/form/Form'
import ButtonAdd from '@components/button-add/ButtonAdd'
import { ColumnsType } from 'antd/es/table'
import {
  APPLICABLE_OBJECTS as APPLICABLE_OBJECT,
  APPLICABLE_OBJECTS,
  IPolicyTable,
  objects,
  pageEnum,
  viewMode
} from '@type/policyManagement'
import dayjs from 'dayjs'
import ButtonDelete from '@components/button-delete/ButtonDelete'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import { RangePickerProps } from 'antd/es/date-picker'
import { convertNumber } from '@utils/helperFunctions'
import { AddAndUpdateFeePackageModal } from '@pages/policy-management/policy-management-modal/add-and-update-fee-package-modal/AddAndUpdateFeePackageModal'
import { useLazyGetListGroupQuery } from '@services/apiAccountGroup'
import { useLazyGetCustomersQuery } from '@services/customerService'
import { CustomAccountGroupSelect } from '@pages/policy-management/components/SelectAccountGroup'
import { CustomPrivateAccountSelect } from '@pages/policy-management/components/SelectPrivateAccount'
import { useLazyGetDetailPolicyQuery } from '@services/transferPolicyServices'
import { GUTTER } from '@constants/appConstant'

type ModalContentType = {
  onCancel: () => void
  refetch?: () => void
  record?: IPolicyTable
  mode?: viewMode
  createPolicy?: any
  updatePolicy?: any
  isLoadingUpdate: boolean
  isLoadingCreate: boolean
}

export type SearchValueType = {
  accountGroupSearch: string
  privateAccountSearch: string
}

const formItemStyle = {
  labelCol: { span: 5 },
  wrapperCol: { span: 14 }
}

export const SetupEWalletTransferMoneyContent = ({
  onCancel,
  refetch,
  record,
  mode,
  createPolicy,
  updatePolicy,
  isLoadingCreate,
  isLoadingUpdate
}: ModalContentType) => {
  const { t } = useTranslation()
  const [form] = useForm()

  const [openAddAndUpdateFeePackage, setOpenAddAndUpdateFeePackage] =
    useState<boolean>(false)
  const [feeMode, setFeeMode] = useState<viewMode>(viewMode.create)
  const [endDateDisable, setEndDateDisable] = useState<any>({})
  const [selectedFeePackageId, setSelectedFeePackageId] = useState<
    string | number
  >('')
  const [object, setObject] = useState<APPLICABLE_OBJECT>(
    APPLICABLE_OBJECT.SYSTEM
  )

  const [searchValue, setSearchValue] = useState<SearchValueType>({
    accountGroupSearch: '',
    privateAccountSearch: ''
  })

  const [feePackageStore, setFeePackageStore] = useState<any>()
  const [isError, setIsError] = useState<boolean>(false)

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

  const [triggerListAccountGroup, { data: listAccountGroup }] =
    useLazyGetListGroupQuery()

  const [triggerListAccount, { data: listAccount }] = useLazyGetCustomersQuery()

  const [triggerDetail, { data: DetailData, isLoading }] =
    useLazyGetDetailPolicyQuery()

  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        key: 'no',
        align: 'center',
        title: t`labels.no`,
        render: (record) => 1
      },
      {
        key: 'transactionFrom',
        align: 'center',
        title: t`policy-management.eWalletTransferMoneyManagement.modalContent.tabelModal.transactionFrom`,
        render: (record) => <div>{convertNumber(record.transactionFrom)}</div>
      },
      {
        key: 'transactionTo',
        align: 'center',
        title: t`policy-management.eWalletTransferMoneyManagement.modalContent.tabelModal.transactionTo`,
        render: (record) => <div>{convertNumber(record.transactionTo)}</div>
      },
      {
        key: 'transactionFee',
        title: t`policy-management.eWalletTransferMoneyManagement.modalContent.tabelModal.transactionFee`,
        children: [
          {
            key: 'transactor',
            align: 'center',
            title: t`policy-management.eWalletTransferMoneyManagement.modalContent.tabelModal.onTransferor`,
            children: [
              {
                key: 'variableFeeTransactor',
                title: t`policy-management.eWalletTransferMoneyManagement.modalContent.tabelModal.variableFee`,
                align: 'center',
                render: (record) => (
                  <div>{convertNumber(record.transferorFlexibleFee)}%</div>
                )
              },
              {
                key: 'fixedFeeTransactor',
                title: t`policy-management.eWalletTransferMoneyManagement.modalContent.tabelModal.fixedFee`,
                align: 'center',
                render: (record) => (
                  <div>{convertNumber(record.transferorFixedFee)}</div>
                )
              },
              {
                key: 'minFeeTransactor',
                title: t`policy-management.eWalletTransferMoneyManagement.modalContent.tabelModal.minFee`,
                align: 'center',
                render: (record) => (
                  <div>{convertNumber(record.transferorFeeMin)}</div>
                )
              },
              {
                key: 'maxFeeTransactor',
                title: t`policy-management.eWalletTransferMoneyManagement.modalContent.tabelModal.maxFee`,
                align: 'center',
                render: (record) => (
                  <div>{convertNumber(record.transferorFeeMax)}</div>
                )
              }
            ]
          },
          {
            key: 'receiver',
            align: 'center',
            title: t`policy-management.eWalletTransferMoneyManagement.modalContent.tabelModal.onReceiver`,
            children: [
              {
                key: 'variableFeeReceiver',
                title: t`policy-management.eWalletTransferMoneyManagement.modalContent.tabelModal.variableFee`,
                align: 'center',
                render: (record) => (
                  <div>{convertNumber(record.receiverFlexibleFee)}%</div>
                )
              },
              {
                key: 'fixedFeeReceiver',
                title: t`policy-management.eWalletTransferMoneyManagement.modalContent.tabelModal.fixedFee`,
                align: 'center',
                render: (record) => (
                  <div>{convertNumber(record.receiverFixedFee)}</div>
                )
              },
              {
                key: 'minFeeReceiver',
                title: t`policy-management.eWalletTransferMoneyManagement.modalContent.tabelModal.minFee`,
                align: 'center',
                render: (record) => (
                  <div>{convertNumber(record.receiverFeeMin)}</div>
                )
              },
              {
                key: 'maxFeeReceiver',
                title: t`policy-management.eWalletTransferMoneyManagement.modalContent.tabelModal.maxFee`,
                align: 'center',
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
        width: 120,
        title: t`policy-management.eWalletTransferMoneyManagement.action`,
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
                  module='wallet_transfer'
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
                  disabled={mode === viewMode.update}
                  module='wallet_transfer'
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

  const onCancelFeePackageModal = () => {
    setOpenAddAndUpdateFeePackage(false)
  }

  useEffect(() => {
    setEndDateDisable(dayjs(dayjs().startOf('day').toISOString()))
  }, [])

  const getDetail = useCallback(async () => {
    const data: any = await triggerDetail(record?.id)
    setObject(data?.data?.applicableObject)
    setFeePackageStore(data?.data)
    form.setFieldsValue({
      applicableObject: data?.data?.applicableObject,
      endDate: data?.data?.endDate ? dayjs(data?.data?.endDate) : null,
      startDate: dayjs(data?.data?.startDate)
    })
    if (data?.data?.applicableObject === APPLICABLE_OBJECTS.ACCOUNT_GROUP) {
      form.setFieldsValue({
        accountGroup: {
          disabled: undefined,
          key: `${data?.data?.applicableObjectId}`,
          label: data?.data?.applicableObjectName,
          title: undefined,
          value: data?.data?.applicableObjectId
        }
      })
    }
    if (data?.data?.applicableObject === APPLICABLE_OBJECTS.PERSONAL_ACCOUNT) {
      form.setFieldsValue({
        accountNumber: {
          disabled: undefined,
          key: `${data?.data?.applicableObjectId}`,
          label: data?.data?.applicableObjectName,
          title: undefined,
          value: data?.data?.applicableObjectId
        }
      })
    }
  }, [record?.id])

  useEffect(() => {
    if (mode === viewMode.update && record) {
      getDetail()
    }
  }, [record, getDetail])

  const toggleFee = (value: any[], type: viewMode) => {
    if ((type === viewMode.create || type === viewMode.update) && value) {
      setFeePackageStore(value)
      setIsError(false)
    } else {
      setFeePackageStore(undefined)
      setIsError(false)
    }
  }

  const onSubmit = async (values: any) => {
    if (!feePackageStore) {
      setIsError(true)
      return
    }
    const payload: any = {
      applicableObject: values.applicableObject,
      startDate: values.startDate.toISOString(),
      depositMethod: [],
      ...feePackageStore
    }
    if (values.endDate) {
      payload.endDate = values.endDate.toISOString()
    }
    if (mode === viewMode.create) {
      if (values.applicableObject === APPLICABLE_OBJECT.ACCOUNT_GROUP) {
        payload.applicableObjectId = values.accountGroup.value
      }
      if (values.applicableObject === APPLICABLE_OBJECT.PERSONAL_ACCOUNT) {
        payload.applicableObjectId = values.accountNumber.value
      }
      const data: any = await createPolicy(payload)
      if (data.data.statusCode === 201) {
        message.success(t('messages.successCreatePolicy'))
        onCancel()
        refetch && refetch()
      }
    } else if (mode === viewMode.update) {
      let valueTypeUpdate: string[] = []
      const { endDate, startDate, applicableObject } = values
      const newData: any = {
        ...values,
        ...feePackageStore,
        id: record?.id,
        startDate: startDate?.toISOString(),
        endDate: endDate ? endDate?.toISOString() : null,
        depositMethod: []
      }
      if (values.applicableObject === APPLICABLE_OBJECT.ACCOUNT_GROUP) {
        newData.applicableObjectId = values.accountGroup.value
      }
      if (values.applicableObject === APPLICABLE_OBJECT.PERSONAL_ACCOUNT) {
        newData.applicableObjectId = values.accountNumber.value
      }
      if (newData && record) {
        for (const key in newData) {
          if (key in record) {
            if (record[key as keyof typeof record] !== newData[key]) {
              valueTypeUpdate.push(key)
            }
          }
        }
        newData.valueTypeUpdate = valueTypeUpdate
        newData.valueTypeDelete = []
      }
      const data: any = await updatePolicy(newData)
      if (data.data.statusCode === 200) {
        message.success(t('messages.successUpdatePolicy'))
        onCancel()
        refetch && refetch()
      }
    }
  }

  return (
    <>
      <Spin spinning={isLoading}>
        <div style={{ padding: '10px' }}>
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
                  initialValue={APPLICABLE_OBJECT.SYSTEM}
                  labelAlign='left'
                  rules={[
                    {
                      required: true,
                      message:
                        t`policy-management.eWalletTransferMoneyManagement.validateRequired`.toString()
                    }
                  ]}
                >
                  <Select
                    // getPopupContainer={(trigger) => trigger.parentNode}
                    disabled={mode === viewMode.update}
                    onChange={(value) => setObject(value)}
                    style={{ minWidth: 220 }}
                    options={objects}
                  />
                </Form.Item>
                {[
                  APPLICABLE_OBJECT.PERSONAL_ACCOUNT,
                  APPLICABLE_OBJECT.ACCOUNT_GROUP
                ].includes(object) && (
                  <>
                    {object === APPLICABLE_OBJECT.ACCOUNT_GROUP ? (
                      <Form.Item
                        name='accountGroup'
                        {...formItemStyle}
                        labelAlign='left'
                        label={t`policy-management.payment.selectAccountGroup`}
                        rules={[
                          {
                            required: true,
                            message:
                              t`policy-management.common.validation.noAccountGroupValidate`.toString()
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
                              t`policy-management.common.validation.noPrivateAccountValidate`.toString()
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
                <div
                  style={{ fontWeight: 600 }}
                >{t`policy-management.eWalletTransferMoneyManagement.modalContent.packagePackage`}</div>
                {!feePackageStore && (
                  <ButtonAdd
                    module='wallet_transfer'
                    label={t`policy-management.eWalletTransferMoneyManagement.modalContent.createNewFeePackage`.toString()}
                    onClick={() => {
                      setOpenAddAndUpdateFeePackage(true)
                      setFeeMode(viewMode.create)
                    }}
                  />
                )}
              </div>
              <Table
                bordered
                dataSource={feePackageStore ? [feePackageStore] : []}
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
                  initialValue={dayjs().startOf('day')}
                  label={t`policy-management.eWalletTransferMoneyManagement.applicableTimeStart`}
                  {...formItemStyle}
                  labelAlign='left'
                  rules={[
                    {
                      required: true,
                      message:
                        t`policy-management.common.validation.noApplicableTime`.toString()
                    },
                    () => ({
                      validator(_, value) {
                        if (
                          value !== null &&
                          form.getFieldValue('endDate') !== null &&
                          value > form.getFieldValue('endDate')
                        ) {
                          return Promise.reject(
                            new Error(
                              `${t(
                                'policy-management.common.validation.startDateSmallerThanEndDateValidate'
                              )}`
                            )
                          )
                        } else {
                          return Promise.resolve()
                        }
                      }
                    })
                  ]}
                >
                  <DatePicker
                    onChange={onChangeStartDate}
                    showTime
                    showNow={false}
                    disabledDate={disabledDate}
                    placeholder={t`policy-management.eWalletTransferMoneyManagement.placeholders.startDate`.toString()}
                    className='w-100'
                    format='DD/MM/YYYY HH:mm:ss'
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name='endDate'
                  label={t`policy-management.eWalletTransferMoneyManagement.applicableTimeEnd`}
                  {...formItemStyle}
                  labelAlign='left'
                >
                  <DatePicker
                    disabled={!form.getFieldValue('startDate')}
                    showTime
                    showNow={false}
                    disabledDate={disabledEndDate}
                    placeholder={t`policy-management.eWalletTransferMoneyManagement.placeholders.endDate`.toString()}
                    className='w-100'
                    format='DD/MM/YYYY HH:mm:ss'
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row className='justify-end'>
              <Col>
                <Button
                  className='mr-10'
                  onClick={onCancel}
                >{t`buttons.back`}</Button>
                <Button
                  loading={
                    mode === viewMode.create ? isLoadingCreate : isLoadingUpdate
                  }
                  type='primary'
                  htmlType='submit'
                >{t`policy-management.payment.establish`}</Button>
              </Col>
            </Row>
            <AddAndUpdateFeePackageModal
              policyMode={mode}
              toggleFee={toggleFee}
              fee={feePackageStore}
              id={selectedFeePackageId}
              open={openAddAndUpdateFeePackage}
              mode={feeMode}
              module={pageEnum.eWalletTransferMoney}
              onCancel={onCancelFeePackageModal}
            />
          </Form>
        </div>
      </Spin>
    </>
  )
}
