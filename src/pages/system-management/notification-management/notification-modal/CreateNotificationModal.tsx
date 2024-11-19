import { useEffect, useRef, useState } from 'react'
import { reduce, isEqual } from 'lodash'

import {
  INotification,
  INotificationForm,
  notificationMode
} from '@type/notification'
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Switch
} from 'antd'
import { useTranslation } from 'react-i18next'
import { APPLICABLE_OBJECTS, viewMode } from '@type/policyManagement'
import {
  applicableObjects,
  serviceRegex,
  serviceTypes
} from '@constants/options'
import { CustomAccountGroupSelect } from '@pages/policy-management/components/SelectAccountGroup'
import { CustomPrivateAccountSelect } from '@pages/policy-management/components/SelectPrivateAccount'
import { useLazyGetCustomersQuery } from '@services/customerService'
import { useLazyGetListGroupQuery } from '@services/apiAccountGroup'
import dayjs, { Dayjs } from 'dayjs'
import {
  useCreateNotificationMutation,
  useLazyGetNotificationQuery,
  useUpdateNotificationMutation
} from '@services/apiNotification'
import { compareData, showSuccessMessage } from '@utils/helperFunctions'
import { ResponseType, STATUS_CODE } from '@type/api'
import { GUTTER } from '@constants/appConstant'
import { TimeFullFormat } from '@constants/datetime'
import { NOTIFICATION_TYPE_SERVICE } from '../NotificationManagementConst'

interface IProps {
  mode: viewMode
  onCancel: () => void
  id?: string
  refetch?: () => void
}

type ResponseData = {
  data: { statusCode: number }
}

type SearchValueType = {
  accountGroupSearch: string
  privateAccountSearch: string
}

export const CreateNotificationModal = ({
  mode,
  onCancel,
  id,
  refetch
}: IProps) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const currentTime = useRef<Dayjs>(dayjs())

  const [object, setObject] = useState<APPLICABLE_OBJECTS>(
    APPLICABLE_OBJECTS.SYSTEM
  )
  const [type, setType] = useState<any>()

  const [searchValue, setSearchValue] = useState<SearchValueType>({
    accountGroupSearch: '',
    privateAccountSearch: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<INotification>()

  const [triggerListAccountGroup, { data: listAccountGroup }] =
    useLazyGetListGroupQuery()
  const [triggerListAccount, { data: listAccount }] = useLazyGetCustomersQuery()
  const [createNotification] = useCreateNotificationMutation()
  const [updateNotification] = useUpdateNotificationMutation()
  const [getNotification] = useLazyGetNotificationQuery()

  const fetchData = async (id: number | string) => {
    setIsLoading(true)
    try {
      const { data } = (await getNotification(id)) as {
        data: ResponseType<INotification>
      }
      if (
        data.statusCode === STATUS_CODE.SUCCESS ||
        (data.statusCode === STATUS_CODE.CREATED && data.data)
      ) {
        setNotification(data.data)
        setObject(data.data.applicableObject ?? APPLICABLE_OBJECTS.SYSTEM)
        const {
          applicableObjectName,
          applicableObject,
          applicableObjectId,
          ...rest
        } = data.data

        if (
          applicableObjectName &&
          applicableObject === APPLICABLE_OBJECTS.ACCOUNT_GROUP
        ) {
          setSearchValue({
            ...searchValue,
            accountGroupSearch: applicableObjectName
          })
          form.setFieldValue('accountGroup', {
            value: applicableObjectId,
            label: applicableObjectName
          })
        }

        if (
          applicableObject === APPLICABLE_OBJECTS.PERSONAL_ACCOUNT &&
          applicableObjectName
        ) {
          setSearchValue({
            ...searchValue,
            privateAccountSearch: applicableObjectName
          })
          form.setFieldValue('accountNumber', {
            value: applicableObjectId,
            label: applicableObjectName
          })
        }

        form.setFieldsValue({
          ...rest,
          applicableObject,
          startDate: data.data.startDate
            ? dayjs(data.data.startDate)
            : undefined,
          status: data.data.status === 1 ? true : false,
        })
        setIsLoading(false)
      }
    } catch (err) {
      setIsLoading(false)
    }
  }

  const onBlur = (value: string, field: string) => {
    form.setFieldValue(field, value.trim())
  }

  useEffect(() => {
    ;(mode === viewMode.update || mode === viewMode.view) && id && fetchData(id)
  }, [id, mode])

  const onSubmit = async (values: INotificationForm) => {
    const {
      startDate,
      applicableObject,
      accountGroup,
      accountNumber,
      ...rest
    } = values

    const date = startDate ? dayjs(startDate).toISOString() : undefined

    const objectIds =
      applicableObject === APPLICABLE_OBJECTS.ACCOUNT_GROUP
        ? accountGroup?.value
        : applicableObject === APPLICABLE_OBJECTS.PERSONAL_ACCOUNT
        ? accountNumber?.value
        : null
    const payload = {
      ...values,
      id: notification?.id ?? undefined,
      applicableObjectId: objectIds,
      status: values.status === true ? 1 : 0,
      startDate: date
    }
    let result
    if (mode === viewMode.create) {
      result = await createNotification({
        startDate: date,
        applicableObjectId: objectIds,
        applicableObject: applicableObject,
        ...rest
      })
    }

    if (mode === viewMode.update && id && notification) {
      let initData = { ...notification }
      let valueTypeUpdate: string[] = []
      valueTypeUpdate = compareData(initData, payload)
      result = await updateNotification({
        id: notification?.id,
        startDate: date,
        applicableObjectId: objectIds,
        applicableObject: applicableObject,
        title: rest.title?.trim(),
        body: rest.body?.trim(),
        valueTypeUpdate: valueTypeUpdate,
        ...rest
      })
    }

    if (
      (result as ResponseData)?.data?.statusCode === STATUS_CODE.CREATED ||
      (result as ResponseData)?.data?.statusCode === STATUS_CODE.SUCCESS
    ) {
      handleSuccess()
    } else {
      handleError()
    }
  }

  const handleSuccess = () => {
    const msg =
      mode === viewMode.create
        ? t`notification-management.message.create-success`
        : t`notification-management.message.edit-success`
    showSuccessMessage(msg)
    setIsLoading(false)
    onCancel()
    form.resetFields()
    refetch?.()
  }

  const handleError = () => {
    const msg =
      mode === viewMode.create
        ? t`notification-management.message.create-failed`
        : t`notification-management.message.edit-failed`
    message.destroy()
    message.error(msg)
    setIsLoading(false)
  }
  const onClose = () => {
    Modal.confirm({
      title: t('notification-management.confirm.update-title'),
      onOk: () => {
        onCancel()
      },
      okText: t('buttons.ok'),
      cancelText: t('buttons.back'),
      type: 'warning'
    })
  }

  const defaultTemplate = (service: NOTIFICATION_TYPE_SERVICE) =>
    serviceRegex.find((item) => item.value === service)

  return (
    <Spin spinning={isLoading}>
      <Form
        layout='vertical'
        onFinish={onSubmit}
        initialValues={{
          status: true,
          startDate: currentTime.current
        }}
        form={form}
      >
        <Row gutter={GUTTER}>
          <Col
            xs={24}
            lg={12}
          >
            <Form.Item
              name='applicableObject'
              label={t`policy-management.payment.applicableObject`}
              labelAlign='left'
              initialValue={APPLICABLE_OBJECTS.SYSTEM}
            >
              <Select
                disabled={mode === viewMode.update}
                className={mode === viewMode.view ? 'readonly-class' : ''}
                onChange={(value) => {
                  setObject(value)
                  if (
                    form.getFieldValue('serviceType') !==
                    NOTIFICATION_TYPE_SERVICE.OTHER
                  )
                    form.resetFields(['serviceType', 'title', 'body'])
                }}
                style={{ minWidth: 220 }}
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
                    labelAlign='left'
                    label={t`policy-management.payment.selectAccountGroup`}
                    rules={[
                      {
                        required: true,
                        message:
                          t`policy-management.depositManagement.validateRequired`.toString()
                      }
                    ]}
                  >
                    <CustomAccountGroupSelect
                      readonly={mode === viewMode.view}
                      listAccountGroup={listAccountGroup}
                      setSearchValue={setSearchValue}
                      searchInput={searchValue}
                      placeholder={t`policy-management.eWalletTransferMoneyManagement.placeholders.accountGroup`.toString()}
                      triggerFunction={triggerListAccountGroup}
                    />
                  </Form.Item>
                ) : (
                  <Form.Item
                    labelAlign='left'
                    name='accountNumber'
                    label={t`policy-management.payment.inputAccount`}
                    rules={[
                      {
                        required: true,
                        message:
                          t`policy-management.depositManagement.validateRequired`.toString()
                      }
                    ]}
                  >
                    <CustomPrivateAccountSelect
                      readonly={mode === viewMode.view}
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
              label={t`notification-management.apply-date`}
              name='startDate'
              rules={[
                () => ({
                  validator(_, value) {
                    if (value.isBefore(currentTime.current, 'second')) {
                      return Promise.reject(
                        new Error(
                          t`notification-management.message.time`.toString()
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
                showTime
                allowClear={false}
                className={`${
                  mode === viewMode.view ? 'readonly-class' : ''
                } w-100`}
                placeholder={t`notification-management.placeholders.date`.toString()}
                format={TimeFullFormat}
              />
            </Form.Item>
            {mode === viewMode.view && (
              <Form.Item
                label={t`notification-management.createdAt`}
                name='startDate'
              >
                <DatePicker
                  showTime
                  allowClear={false}
                  className={`${
                    mode === viewMode.view ? 'readonly-class' : ''
                  } w-100`}
                  format={TimeFullFormat}
                />
              </Form.Item>
            )}

            <Form.Item
              className='custom-switch'
              label={t`notification-management.status`}
              name='status'
              valuePropName='checked'
            >
              <Switch
                className={mode === viewMode.view ? 'readonly-class' : ''}
                checked = {notification?.status === 1? true:false}
              />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            lg={12}
          >
            <Form.Item
              label={t`notification-management.service`}
              name='serviceType'
              rules={[
                {
                  required: true,
                  message:
                    t`notification-management.message.service-required`.toString()
                }
              ]}
            >
              <Select
                className={mode === viewMode.view ? 'readonly-class' : ''}
                disabled={mode === viewMode.update}
                options={serviceTypes}
                placeholder={t`notification-management.placeholders.service`}
                onChange={(value) => {
                  const data = defaultTemplate(value)
                  data && setType(data)
                  data &&
                    form.setFieldsValue({
                      title: data.defaultTile,
                      body: data.defaultBody
                    })
                }}
              />
            </Form.Item>
            <Form.Item
              label={t`notification-management.text-title`}
              name='title'
              rules={[
                {
                  required: true,
                  message: t('notification-management.message.title').toString()
                },
                {
                  pattern:
                    (object === APPLICABLE_OBJECTS.SYSTEM &&
                      type?.titleRegex) ||
                    undefined,
                  message: t(
                    'notification-management.message.format'
                  ).toString()
                },
                {
                  max: 100,
                  message: t(
                    'notification-management.message.minMaxFormValidate',
                    {
                      max: 100
                    }
                  ).toString()
                }
              ]}
            >
              <Input
                className={mode === viewMode.view ? 'readonly-class' : ''}
                placeholder={t`notification-management.placeholders.text-title`.toString()}
                onBlur={(e) => onBlur(e.target.value, 'title')}
              />
            </Form.Item>
            <Form.Item
              label={t`notification-management.content`}
              name='body'
              rules={[
                {
                  required: true,
                  message: t(
                    'notification-management.message.content'
                  ).toString()
                },
                {
                  pattern:
                    (object === APPLICABLE_OBJECTS.SYSTEM && type?.bodyRegex) ||
                    undefined,
                  message: t(
                    'notification-management.message.format'
                  ).toString()
                },
                {
                  max: 500,
                  message: t(
                    'notification-management.message.minMaxFormValidate',
                    {
                      max: 500
                    }
                  ).toString()
                }
              ]}
            >
              <Input.TextArea
                readOnly={mode === viewMode.view}
                rows={5}
                placeholder={t`notification-management.placeholders.content`.toString()}
                onBlur={(e) => onBlur(e.target.value, 'body')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item noStyle>
          <div style={{ textAlign: 'end' }}>
            <Button
              className='mr-10'
              type='primary'
              ghost
              onClick={onClose}
            >
              {mode === viewMode.view
                ? t`notification-management.close`
                : t`notification-management.cancel`}
            </Button>
            {mode !== viewMode.view && (
              <Button
                type='primary'
                htmlType='submit'
              >
                {mode === viewMode.create
                  ? t`notification-management.add`
                  : t`notification-management.update`}
              </Button>
            )}
          </div>
        </Form.Item>
      </Form>
    </Spin>
  )
}
