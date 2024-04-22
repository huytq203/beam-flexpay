import { GUTTER } from '@constants/appConstant'
import ButtonAdd from '@components/button-add/ButtonAdd'
import { useLazyPaymentPartnerFindAllQuery } from '@services/cmsPaymentParner'
import { useLazyPaymentServiceFindAllQuery } from '@services/cmsPaymentService'
import { viewMode } from '@type/customer'
import {
  Button,
  Col,
  Form,
  Modal,
  Row,
  Select,
  Card,
  FloatButton,
  FormListFieldData,
  Space,
  notification,
  Radio,
  Checkbox,
  Badge
} from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CustomAccountingSelect from './components/customer-accouting-select/CustomAccountingSelect'
import {
  accountingOptions,
  accountingSubType,
  accountingTransactionType,
  fundsOptions,
  walletTypeOptions
} from '@constants/options'
import { useCreateAccountingMutation, useUpdateAccountingMutation } from '@services/accountingService'
import { useGetListWalletsQuery, useLazyGetListWalletsQuery } from '@services/apiInternalWallet'
import Title from 'antd/es/typography/Title'
import { Accounting, AccountingBalanceType, AccountingDetails, AccountingDetailsType } from '@type/accounting'
import { QueryStatus } from '@reduxjs/toolkit/dist/query'
import { AccountingTransactionType } from '@type/accounting'
import { AccountingSubType } from '@type/accounting'

type props = {
  title: string
  record?: any | undefined
  isShow: boolean
  onCancel: VoidFunction
  mode: viewMode
  selectedAccounting?: Accounting
}

function TransactionAccountingConfigurationForm({
  record,
  isShow,
  onCancel,
  title,
  mode,
  selectedAccounting,
}: props) {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const transactionType = Form.useWatch('transactionType', form)
  const details: AccountingDetails[] = Form.useWatch('details', form)

  const [getPartners] = useLazyPaymentPartnerFindAllQuery()
  const [getServices] = useLazyPaymentServiceFindAllQuery()
  const {
    data: internalWalletData,
    refetch
  } = useGetListWalletsQuery({
    order: 'DESC',
    page: 1,
    take: 10,
    query: '',
    orderBy: 'createdAt'
  })
  const [createAccounting, createAccountingStatus] = useCreateAccountingMutation()
  const [updateAccounting, updateAccountingStatus] = useUpdateAccountingMutation()

  const updateLoading = false

  useEffect(() => {
    console.log(transactionType)
  }, [transactionType])

  const handleSubmit = async (value: Record<string, any>) => {
    if (!value) {
      return
    }

    switch (mode) {
      case viewMode.create:
        await createAccounting(value)
          .then(_ => {
            notification.success({
              message: t(`internal-wallet.messages.create-accounting-success`)
            })
            form.resetFields()
            onCancel()
          })
          .catch(_ => {
            notification.error({
              message: t(`internal-wallet.messages.create-accounting-failed`)
            })
          })
      case viewMode.update:
        if (selectedAccounting === undefined) {
          return
        }
        await updateAccounting({ id: selectedAccounting.id, payload: value })
          .then(_ => {
            notification.success({
              message: t(`internal-wallet.messages.create-accounting-success`)
            })
            form.resetFields()
            onCancel()
          })
          .catch(_ => {
            notification.error({
              message: t(`internal-wallet.messages.create-accounting-failed`)
            })
          })
    }

  }

  useEffect(() => {
    console.log(mode)
    switch (mode) {
      case viewMode.create:
        form.setFieldsValue({
          details: [
            {
              type: AccountingDetailsType.CREDIT,
            },
            {
              type: AccountingDetailsType.DEBIT,
            }
          ]
        })
        break;
      case viewMode.view:
      case viewMode.update:
        form.setFieldsValue(selectedAccounting)
        break;
    }
  }, [mode])

  useEffect(() => {
    if (isShow && record && record.id) form.setFieldsValue(record)
    if (!isShow) form.resetFields()
  }, [isShow, record])

  const onSelectData = (value: Record<string, any>, field: string) => {
    form.setFieldValue(field, value.value)
  }

  const AccountingDetailsForm = (props: {
    field: FormListFieldData
    index: number
    isDefaultPositive: boolean
    onRemove: () => void
  }) => {
    return (
      <Card
        extra={<Badge />}
      >
        <Form.Item
          label={t('internal-wallet.modal.walletType')}
          name={[props.field.name, 'balanceType']}
          rules={[
            {
              required: true,
              message: t('internal-wallet.messages.required').toString()
            }
          ]}
        >
          <Select
            placeholder={t('internal-wallet.placeholders.wallet_type')}
            disabled={mode === viewMode.view}
            options={walletTypeOptions}
            onChange={value => {
              if (value !== AccountingBalanceType.INTERNAL) {
                form.setFieldValue([`details`, props.field.name, "internalWalletId"], null)
              }
            }}
          />
        </Form.Item>
        {/* Số ví điện tử - select - required */}
        <Form.Item
          label={t('internal-wallet.modal.walletNumber')}
          name={[props.field.name, 'internalWalletId']}
        >
          <Select
            disabled={details[props.index].balanceType != AccountingBalanceType.INTERNAL || mode === viewMode.view}
            placeholder={t(
              'internal-wallet.placeholders.wallet_number'
            ).toString()}
            options={internalWalletData?.data.map(internalWallet => ({
              label: `${internalWallet.balanceInternalGroup.walletGroup}.${internalWallet.walletNumber} - ${internalWallet.name}`,
              value: internalWallet.id,
            }))}
          />
        </Form.Item>
        <Form.Item
          initialValue={props.isDefaultPositive}
          label={t('internal-wallet.modal.accounting')}
          name={[props.field.name, 'isPositive']}
          rules={[
            {
              required: true,
              message: t('internal-wallet.messages.required').toString()
            }
          ]}
        >
          <Select
            disabled={mode === viewMode.view}
            placeholder={t(
              'internal-wallet.placeholders.accounting'
            ).toString()}
            options={accountingOptions}
          />
        </Form.Item>
      </Card>
    )
  }

  return (
    <Modal
      open={isShow}
      footer={null}
      title={title}
      onCancel={onCancel}
      width={1000}
    >
    <h1>{mode}</h1>
      <Form
        layout='vertical'
        form={form}
        onFinish={handleSubmit}
      >
        {/* Loại giao dịch - select */}
        <Form.Item
          name='transactionType'
          label={t('internal-wallet.modal.transactionType')}
          rules={[
            {
              required: true,
              message: t('internal-wallet.messages.required').toString()
            }
          ]}
        >
          <Select
            placeholder={t('internal-wallet.placeholders.transaction_type')}
            disabled={mode === viewMode.view}
            options={accountingTransactionType}
            onChange={value => {
              if (value !== AccountingTransactionType.BILL_PAYMENT &&
                value !== AccountingTransactionType.ADVANDED_COLLECT) {
                form.setFieldValue("serviceId", null)
                form.setFieldValue("partnerId", null)
              }
            }}
          />
        </Form.Item>
        {/* Sub type - select */}
        <Form.Item
          name='subTypes'
          label={t('internal-wallet.modal.subType')}
          rules={[
            {
              required: true,
              message: t('internal-wallet.messages.required').toString()
            }
          ]}
        >
          <Checkbox.Group
            options={accountingSubType}
            disabled={mode === viewMode.view}
            defaultValue={['Apple']}
          />
        </Form.Item>
        {/* Nguồn tiền - select */}
        <Form.Item
          name='fundSource'
          label={t('internal-wallet.modal.funds')}
          rules={[
            {
              required: true,
              message: t('internal-wallet.messages.required').toString()
            }
          ]}
        >
          <Select
            placeholder={t('internal-wallet.placeholders.funds')}
            disabled={mode === viewMode.view}
            options={fundsOptions}
          />
        </Form.Item>
        {/* Dịch vụ - select */}
        <Form.Item
          name='serviceId'
          label={t('internal-wallet.modal.service')}
          rules={[
            {
              validator: async (n, serviceId) => {
                if (transactionType != AccountingTransactionType.ADVANDED_COLLECT
                  && transactionType != AccountingTransactionType.BILL_PAYMENT
                ) {
                  return
                } else if (!serviceId) {
                  return Promise.reject(new Error(t('internal-wallet.messages.required').toString()))
                }
              },
            }
          ]}
        >
          <CustomAccountingSelect
            trigger={getServices}
            search={{
              page: 1,
              take: 10,
              active: true
            }}
            field='name'
            onSelectData={onSelectData}
            valueSearch='serviceId'
            disabled={(transactionType != AccountingTransactionType.ADVANDED_COLLECT &&
              transactionType != AccountingTransactionType.BILL_PAYMENT) ||
              transactionType === undefined ||
              mode === viewMode.view}
            placeholder={t('internal-wallet.placeholders.service')}
          />
        </Form.Item>
        {/* Đối tác - select */}
        <Form.Item
          name='partnerId'
          label={t('internal-wallet.modal.partner')}
          rules={[
            {
              validator: async (n, partnerId) => {
                if (transactionType != AccountingTransactionType.ADVANDED_COLLECT
                  && transactionType != AccountingTransactionType.BILL_PAYMENT
                ) {
                  return
                } else if (!partnerId) {
                  return Promise.reject(new Error(n.message))
                }
              },
            }
          ]}
        >
          <CustomAccountingSelect
            trigger={getPartners}
            search={{
              page: 1,
              take: 10,
              type: 'REPAYMENT'
            }}
            field='name'
            disabled={(transactionType != AccountingTransactionType.ADVANDED_COLLECT &&
              transactionType != AccountingTransactionType.BILL_PAYMENT) ||
              transactionType === undefined ||
              mode === viewMode.view}
            onSelectData={onSelectData}
            valueSearch='partnerId'
            placeholder={t('internal-wallet.placeholders.partner')}
          />
        </Form.Item>
        {/* Ghi nợ - title*/}
        <Form.Item noStyle>
          <Title level={5}>{t('accounting.details.type.debit')}</Title>
        </Form.Item>
        {/* Loại ví - select */}
        <Form.List
          name="details"
          rules={[
            {
              validator: async (_, details) => {
                const childCount = (details as AccountingDetails[])
                  .filter(details => details.type === AccountingDetailsType.DEBIT)
                  .length

                if (childCount < 1) {
                  return Promise.reject(new Error(t('accounting.messages.at-least-one-debit-accounting-details') ?? ''))
                }
              }
            }
          ]}

        >
          {(fields, { add, remove }) => (
            <div>
              {fields
                .map((field, index) => (
                  details[index].type == AccountingDetailsType.DEBIT
                    ? <AccountingDetailsForm
                      field={field}
                      index={index}
                      isDefaultPositive={false}
                      onRemove={() => remove(field.name)}
                    />
                    : <Space />
                ))}
              <ButtonAdd
                module='internal-wallet'
                disabled={mode === viewMode.view}
                onClick={() => {
                  const initialValue: AccountingDetails = {
                    type: AccountingDetailsType.DEBIT,
                  }
                  add(initialValue)
                }}
              />
            </div>
          )}
        </Form.List>
        {/* Ghi có - title*/}
        <Form.Item noStyle>
          <Title level={5}>{t('accounting.details.type.credit')}</Title>
        </Form.Item>
        {/* Loại ví - select */}
        <Form.List
          name="details"
          rules={[
            {
              validator: async (_, details) => {
                const childCount = (details as AccountingDetails[])
                  .filter(details => details.type === AccountingDetailsType.CREDIT)
                  .length

                if (childCount < 1) {
                  return Promise.reject(new Error(t('accounting.messages.at-least-one-credit-accounting-details') ?? ''))
                }
              }
            }
          ]}
        >
          {(fields, { add, remove, }) => (
            <div>
              {fields
                .map((field, index) => (
                  details[index].type == AccountingDetailsType.CREDIT
                    ? <AccountingDetailsForm
                      field={field}
                      index={index}
                      isDefaultPositive={true}
                      onRemove={() => remove(field.name)}
                    />
                    : <Space />
                ))}
              <ButtonAdd
                module='internal-wallet'
                disabled={mode === viewMode.view}
                onClick={() => {
                  const initialValue: AccountingDetails = {
                    type: AccountingDetailsType.CREDIT,
                  }
                  add(initialValue)
                }}
              />
            </div>
          )}
        </Form.List>
        <Row
          justify='end'
          gutter={GUTTER}
        >
          <Col>
            <Button
              className='btn-100'
              onClick={onCancel}
              loading={createAccountingStatus.status == QueryStatus.pending || updateLoading}
            >
              {t('buttons.cancel')}
            </Button>
          </Col>
          <Col>
            <Button
              className='btn-100'
              type='primary'
              htmlType='submit'
              loading={createAccountingStatus.status == QueryStatus.pending || updateLoading}
            >
              {t('buttons.save')}
            </Button>
          </Col>
        </Row>
      </Form >
    </Modal >
  )
}

export default TransactionAccountingConfigurationForm