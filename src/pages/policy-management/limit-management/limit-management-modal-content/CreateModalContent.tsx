import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  notification,
  Row,
  Select,
  Spin
} from 'antd'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  blockArrowValue,
  blockLetterDecimal,
  moneyInputFormatter
} from '@utils/helperFunctions'
import { useForm } from 'antd/es/form/Form'
import { SearchType, SearchValueType, viewMode } from '@type/policyManagement'
import { CustomAccountGroupSelect } from '@pages/policy-management/components/SelectAccountGroup'
import { CustomPrivateAccountSelect } from '@pages/policy-management/components/SelectPrivateAccount'
import { useLazyGetListGroupQuery } from '@services/apiAccountGroup'
import { useLazyGetCustomersQuery } from '@services/customerService'
import dayjs from 'dayjs'
import { RangePickerProps } from 'antd/es/date-picker'
import {
  APPLICABLE_OBJECTS,
  limitTimeTypeOptions,
  limitTypeOptions,
  limitValueTypeOptions,
  objects,
  transactionType
} from '../LimitAndRegulationsConst'
import {
  useCreateTransactionLimitMutation,
  useLazyGetDetailTransactionLimitQuery,
  useUpdateTransactionLimitMutation
} from '@services/limitRegulationService'
import { ConfirmExistModal } from './ConfirmExistModal'
import { GUTTER } from '@constants/appConstant'

type ModalContentType = {
  onCancel: () => void
  refetch?: () => void
  mode?: viewMode
  id?: number
  visibleConfirmModal?: boolean
  setVisibleConfirmModal?: React.Dispatch<React.SetStateAction<boolean>>
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  onCloseConfirmModal?: () => void
}

export const CreateLimitAndRegulationsContent = ({
  onCancel,
  refetch,
  mode,
  id,
  visibleConfirmModal,
  setOpen,
  setVisibleConfirmModal,
  onCloseConfirmModal
}: ModalContentType) => {
  const { t: trans } = useTranslation()
  const [form] = useForm()

  const [object, setObject] = useState<APPLICABLE_OBJECTS>(
    APPLICABLE_OBJECTS.SYSTEM
  )

  const [search, setSearch] = useState<SearchType>({ page: 1, take: 10 })

  const [searchValue, setSearchValue] = useState<SearchValueType>({
    accountGroupSearch: '',
    privateAccountSearch: ''
  })

  const [triggerListAccountGroup, { data: listAccountGroup }] =
    useLazyGetListGroupQuery()

  const [triggerListAccount, { data: listAccount }] = useLazyGetCustomersQuery()

  const [createTransactionLimit, { isLoading: isLoadingCreate }] =
    useCreateTransactionLimitMutation()

  const [
    triggerDetail,
    { data: DetailData, isLoading: isLoadingDetailData, isError }
  ] = useLazyGetDetailTransactionLimitQuery()

  const [updateTransactionLimit, { isLoading: isLoadingUpdate }] =
    useUpdateTransactionLimitMutation()

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    // Can not select days before today and today
    return current && current < dayjs().startOf('day')
  }

  const onClear = (value: string) => {
    const newSearch = {
      ...search,
      page: 1,
      [value]: undefined
    }
    setSearch(newSearch)
  }

  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      startDate: values.startDate.toISOString()
    }
    if (object === APPLICABLE_OBJECTS.ACCOUNT_TYPE) {
      payload.accountGroupId = values.accountGroupId.value
    }
    if (object === APPLICABLE_OBJECTS.PRIVATE_ACCOUNT) {
      payload.accountNumber = values.accountNumber.label
    }
    if (mode === viewMode.create) {
      const data: any = await createTransactionLimit(payload)
      if (data.data.statusCode === 201) {
        notification.success({
          message: trans('messages.successCreateLimit')
        })
        setOpen && setOpen(false)
        refetch && refetch()
      }
    } else if (mode === viewMode.update) {
      let valueTypeUpdate: string[] = []
      let initData = { ...DetailData?.data }
      payload.id = id
      if (initData.applicableObject === APPLICABLE_OBJECTS.ACCOUNT_TYPE) {
        initData.accountGroupId = initData.accountGroup.id
        delete initData.accountGroup
      }
      if (initData.applicableObject === APPLICABLE_OBJECTS.PRIVATE_ACCOUNT) {
        initData.accountNumber = initData.account.accountNumber
        delete initData.account
      }
      if (initData && payload) {
        for (const key in payload) {
          if (key in initData) {
            if (initData[key] !== payload[key]) {
              valueTypeUpdate.push(key)
            }
          }
        }
      }
      payload.valueTypeUpdate = valueTypeUpdate
      payload.valueTypeDelete = []
      const data: any = await updateTransactionLimit(payload)
      if (data.data.statusCode === 200) {
        notification.success({
          message: trans('messages.successUpdateLimit')
        })
        setOpen && setOpen(false)
        refetch && refetch()
      }
    }
  }

  const getDetailData = useCallback(async () => {
    await triggerDetail(id)
    setObject(DetailData?.data?.applicableObject)
    form.setFieldsValue({
      name: DetailData?.data?.name,
      applicableObject: DetailData?.data?.applicableObject,
      startDate: dayjs(DetailData?.data?.startDate),
      limitType: DetailData?.data?.limitType,
      timeTypeApply: DetailData?.data?.timeTypeApply,
      serviceType: DetailData?.data?.serviceType,
      valueTypeLimit: DetailData?.data?.valueTypeLimit,
      value: DetailData?.data?.value
    })
    if (
      DetailData?.data?.applicableObject === APPLICABLE_OBJECTS.ACCOUNT_TYPE
    ) {
      form.setFieldsValue({
        accountGroupId: {
          value: DetailData?.data?.accountGroup?.id,
          label: DetailData?.data?.accountGroup?.name
        }
      })
    }
    if (
      DetailData?.data?.applicableObject === APPLICABLE_OBJECTS.PRIVATE_ACCOUNT
    ) {
      form.setFieldsValue({
        accountNumber: {
          value: DetailData?.data?.account?.id,
          label: DetailData?.data?.account?.accountNumber
        }
      })
    }
  }, [id, DetailData?.data])

  useEffect(() => {
    if (mode === viewMode.update && id) {
      getDetailData()
    }
  }, [id, getDetailData])

  useEffect(() => {
    if (isError) {
    }
  }, [])

  return (
    <>
      <Spin spinning={isLoadingDetailData}>
        <Form
          form={form}
          layout='vertical'
          onFinish={onSubmit}
        >
          <Row gutter={GUTTER}>
            <Col span={12}>
              <Form.Item
                name='name'
                rules={[
                  {
                    required: true,
                    message:
                      trans`policy-management.limitAndRegulations.validate.required`.toString()
                  },
                  {
                    max: 500,
                    message: trans`messages.max500characters`.toString()
                  },
                  () => ({
                    validator(_, value) {
                      if (
                        value !== '' &&
                        value !== undefined &&
                        value.trim() === ''
                      ) {
                        return Promise.reject(
                          new Error(
                            trans`policy-management.limitAndRegulations.validate.required`.toString()
                          )
                        )
                      } else return Promise.resolve()
                    }
                  })
                ]}
                labelAlign='left'
                label={trans`policy-management.limitAndRegulations.label.limitName`.toString()}
              >
                <Input
                  disabled={mode === viewMode.update}
                  placeholder={trans`policy-management.limitAndRegulations.placeholder.limitNamePlaceholder`.toString()}
                ></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='applicableObject'
                initialValue={APPLICABLE_OBJECTS.SYSTEM}
                rules={[
                  {
                    required: true,
                    message:
                      trans`policy-management.limitAndRegulations.validate.required`.toString()
                  }
                ]}
                labelAlign='left'
                label={trans`policy-management.limitAndRegulations.label.appliableObject`.toString()}
              >
                <Select
                  disabled={mode === viewMode.update}
                  onChange={(value) => setObject(value)}
                  placeholder={trans`policy-management.limitAndRegulations.placeholder.appliableObjectPlaceholder`.toString()}
                >
                  {objects.map((el) => (
                    <Select.Option
                      key={el.value}
                      value={el.value}
                    >
                      {el.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {[
              APPLICABLE_OBJECTS.ACCOUNT_TYPE,
              APPLICABLE_OBJECTS.PRIVATE_ACCOUNT
            ].includes(object) && (
              <Col span={12}>
                {object === APPLICABLE_OBJECTS.ACCOUNT_TYPE ? (
                  <Form.Item
                    name='accountGroupId'
                    label={trans`policy-management.payment.selectAccountGroup`}
                    rules={[
                      {
                        required: true,
                        message:
                          trans`policy-management.limitAndRegulations.validate.required`.toString()
                      }
                    ]}
                  >
                    <CustomAccountGroupSelect
                      disabled={mode === viewMode.update}
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
                    rules={[
                      {
                        required: true,
                        message:
                          trans`policy-management.limitAndRegulations.validate.required`.toString()
                      }
                    ]}
                  >
                    <CustomPrivateAccountSelect
                      disabled={mode === viewMode.update}
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
            <Col span={12}>
              <Form.Item
                name='limitType'
                rules={[
                  {
                    required: true,
                    message:
                      trans`policy-management.limitAndRegulations.validate.required`.toString()
                  }
                ]}
                labelAlign='left'
                label={trans`policy-management.limitAndRegulations.label.limitType`.toString()}
              >
                <Select
                  placeholder={trans`policy-management.limitAndRegulations.placeholder.limitTypePlaceholder`.toString()}
                >
                  {limitTypeOptions.map((el) => (
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
            <Col span={12}>
              <Form.Item
                name='serviceType'
                rules={[
                  {
                    required: true,
                    message:
                      trans`policy-management.limitAndRegulations.validate.required`.toString()
                  }
                ]}
                labelAlign='left'
                label={trans`policy-management.limitAndRegulations.label.transactionType`.toString()}
              >
                <Select
                  placeholder={trans`policy-management.limitAndRegulations.placeholder.limitTypePlaceholder`.toString()}
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
            <Col span={12}>
              <Form.Item
                name='valueTypeLimit'
                rules={[
                  {
                    required: true,
                    message:
                      trans`policy-management.limitAndRegulations.validate.required`.toString()
                  }
                ]}
                labelAlign='left'
                label={trans`policy-management.limitAndRegulations.label.limitValueType`.toString()}
              >
                <Select
                  placeholder={trans`policy-management.limitAndRegulations.placeholder.limitValueTypePlaceholder`.toString()}
                >
                  {limitValueTypeOptions.map((el) => (
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
            <Col span={12}>
              <Form.Item
                name='value'
                labelAlign='left'
                label={trans`policy-management.limitAndRegulations.label.limitValue`.toString()}
                rules={[
                  {
                    required: true,
                    message:
                      trans`policy-management.limitAndRegulations.validate.required`.toString()
                  },
                  () => ({
                    validator(_, value) {
                      if (value < 0 && value !== null) {
                        return Promise.reject(
                          new Error(
                            trans`policy-management.limitAndRegulations.validate.smallerThanZeroValidate`.toString()
                          )
                        )
                      } else {
                        return Promise.resolve()
                      }
                    }
                  })
                ]}
              >
                <InputNumber
                  className='w-100'
                  onKeyPress={blockLetterDecimal}
                  formatter={moneyInputFormatter}
                  onKeyDown={blockArrowValue}
                  placeholder={trans`policy-management.limitAndRegulations.placeholder.limitValuePlaceholder`.toString()}
                ></InputNumber>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='timeTypeApply'
                rules={[
                  {
                    required: true,
                    message:
                      trans`policy-management.limitAndRegulations.validate.required`.toString()
                  }
                ]}
                labelAlign='left'
                label={trans`policy-management.limitAndRegulations.label.timeLimit`.toString()}
              >
                <Select
                  placeholder={trans`policy-management.limitAndRegulations.placeholder.timeLimitPlaceholder`.toString()}
                  options={limitTimeTypeOptions}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name='startDate'
                rules={[
                  {
                    required: true,
                    message:
                      trans`policy-management.limitAndRegulations.validate.required`.toString()
                  }
                ]}
                labelAlign='left'
                label={trans`policy-management.limitAndRegulations.label.appliableTime`.toString()}
                initialValue={dayjs().startOf('day')}
              >
                <DatePicker
                  allowClear={false}
                  className='w-100'
                  placeholder={trans`policy-management.limitAndRegulations.placeholder.appliableTimePlaceholder`.toString()}
                  disabledDate={disabledDate}
                  format='DD/MM/YYYY HH:mm:ss '
                  showTime
                />
              </Form.Item>
            </Col>
          </Row>
          <Row
            gutter={GUTTER}
            justify='end'
          >
            <Col>
              <Button
                onClick={onCancel}
              >{trans`policy-management.limitAndRegulations.back`}</Button>
            </Col>
            <Col>
              <Button
                htmlType='submit'
                type='primary'
                loading={
                  mode === viewMode.create ? isLoadingCreate : isLoadingUpdate
                }
              >
                {mode === viewMode?.create
                  ? trans`policy-management.limitAndRegulations.create`
                  : trans`policy-management.limitAndRegulations.edit`}
              </Button>
            </Col>
          </Row>
        </Form>
        <ConfirmExistModal
          onCloseConfirmModal={onCloseConfirmModal}
          centered
          setOpen={setOpen}
          open={visibleConfirmModal}
          visibleConfirmModal={visibleConfirmModal}
          mode={mode}
          onCancel={onCancel}
        />
      </Spin>
    </>
  )
}
