import { GUTTER } from '@constants/appConstant'
import { FeeOptions } from '@constants/options'
import { pageEnum, viewMode } from '@type/policyManagement'
import {
  blockArrowValue,
  blockLetterDecimal,
  blockLetterValue,
  moneyInputFormatter
} from '@utils/helperFunctions'
import { Button, Col, Form, InputNumber, Row, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { t } from 'i18next'
import { useState } from 'react'

type AddFeePackageModalType = {
  onCancel: () => void
  toggleFee?: (value: any[], type: viewMode) => void
  module?: pageEnum
  mode?: viewMode
  fee?: any
}

export const AddFeePackageModal = ({
  onCancel,
  toggleFee,
  module
}: AddFeePackageModalType) => {
  const [form] = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState<'FLEXIBLE' | 'FIXED'>('FLEXIBLE')

  const onSubmit = (values: any) => {
    setIsLoading(true)
    if (values && toggleFee) {
      if (!values.transactionTo) {
        values.transactionTo = 10000 * 1000000000
      }
      if (!values.transactionFrom) {
        values.transactionFrom = 0
      }
      toggleFee(values, viewMode.create)
      form.resetFields()
      setIsLoading(false)
      onCancel()
    }
  }

  const renderByType = (type: 'FLEXIBLE' | 'FIXED') => {
    if (type === 'FIXED') {
      return (
        <Row gutter={GUTTER}>
          <Col span={12}>
            <Form.Item
              labelAlign='left'
              name='transferorFixedFee'
              label={t`policy-management.depositManagement.modalContent.tabelModal.fixedFee`}
              dependencies={['type']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message:
                    t`policy-management.common.validation.noTransactionFixedFeeValidate`.toString()
                },
                () => ({
                  validator(_, value) {
                    if (value < 0 && value !== null) {
                      return Promise.reject(
                        t(
                          'policy-management.common.biggerThanZeroValidate'
                        ).toString()
                      )
                    } else {
                      return Promise.resolve()
                    }
                  }
                })
              ]}
            >
              <InputNumber
                type='text'
                inputMode='numeric'
                style={{ width: '100%' }}
                formatter={moneyInputFormatter}
                onKeyDown={blockArrowValue}
                onKeyPress={blockLetterDecimal}
                placeholder={t`policy-management.depositManagement.modalContent.feePackage.fixedFeePlaceholder`.toString()}
              />
            </Form.Item>
          </Col>
        </Row>
      )
    } else {
      return (
        <Row gutter={GUTTER}>
          <Col span={12}>
            <Form.Item
              name='transferorFeeMin'
              initialValue={undefined}
              label={t`policy-management.depositManagement.modalContent.tabelModal.minFee`}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value > getFieldValue('transferorFeeMax') && value) {
                      form.setFields([
                        {
                          name: 'transferorFeeMax',
                          errors: []
                        }
                      ])
                      return Promise.reject(
                        t`policy-management.depositManagement.minFeeValidate`
                      )
                    } else {
                      form.setFields([
                        {
                          name: 'transferorFeeMax',
                          errors: []
                        }
                      ])
                      return Promise.resolve()
                    }
                  }
                })
              ]}
            >
              <InputNumber
                type='text'
                inputMode='numeric'
                defaultValue={undefined}
                style={{ width: '100%' }}
                formatter={moneyInputFormatter}
                onKeyDown={blockArrowValue}
                onKeyPress={blockLetterDecimal}
                placeholder={t`policy-management.depositManagement.modalContent.feePackage.minFeePlaceholder`.toString()}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='transferorFeeMax'
              label={t`policy-management.depositManagement.modalContent.tabelModal.maxFee`}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value < getFieldValue('transferorFeeMin') && value) {
                      form.setFields([
                        {
                          name: 'transferorFeeMin',
                          errors: []
                        }
                      ])
                      return Promise.reject(
                        t`policy-management.depositManagement.maxFeeValidate`
                      )
                    } else {
                      form.setFields([
                        {
                          name: 'transferorFeeMin',
                          errors: []
                        }
                      ])
                      return Promise.resolve()
                    }
                  }
                })
              ]}
            >
              <InputNumber
                type='text'
                inputMode='numeric'
                defaultValue={undefined}
                style={{ width: '100%' }}
                formatter={moneyInputFormatter}
                onKeyDown={blockArrowValue}
                onKeyPress={blockLetterDecimal}
                placeholder={t`policy-management.depositManagement.modalContent.feePackage.maxFeePlaceholder`.toString()}
              />
            </Form.Item>
          </Col>
        </Row>
      )
    }
  }

  const renderByTypeReceiver = () => {
    if (type === 'FLEXIBLE') {
      return (
        <Row gutter={GUTTER}>
          <Col span={12}>
            <Form.Item
              name='receiverFeeMin'
              label={t`policy-management.depositManagement.modalContent.tabelModal.minFee`}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value > getFieldValue('receiverFeeMax') && value) {
                      form.setFields([
                        {
                          name: 'receiverFeeMax',
                          errors: []
                        }
                      ])
                      return Promise.reject(
                        t`policy-management.depositManagement.minFeeValidate`
                      )
                    } else {
                      form.setFields([
                        {
                          name: 'receiverFeeMax',
                          errors: []
                        }
                      ])
                      return Promise.resolve()
                    }
                  }
                })
              ]}
            >
              <InputNumber
                // disabled={mode == viewMode.update}
                type='text'
                inputMode='numeric'
                style={{ width: '100%' }}
                formatter={moneyInputFormatter}
                onKeyDown={blockArrowValue}
                onKeyPress={blockLetterDecimal}
                placeholder={t`policy-management.depositManagement.modalContent.feePackage.minFeePlaceholder`.toString()}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='receiverFeeMax'
              label={t`policy-management.depositManagement.modalContent.tabelModal.maxFee`}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value < getFieldValue('receiverFeeMin') && value) {
                      form.setFields([
                        {
                          name: 'receiverFeeMin',
                          errors: []
                        }
                      ])
                      return Promise.reject(
                        t`policy-management.depositManagement.minFeeValidate`
                      )
                    } else {
                      form.setFields([
                        {
                          name: 'receiverFeeMin',
                          errors: []
                        }
                      ])
                      return Promise.resolve()
                    }
                  }
                })
              ]}
            >
              <InputNumber
                // disabled={mode == viewMode.update}
                type='text'
                inputMode='numeric'
                style={{ width: '100%' }}
                formatter={moneyInputFormatter}
                onKeyDown={blockArrowValue}
                onKeyPress={blockLetterDecimal}
                placeholder={t`policy-management.depositManagement.modalContent.feePackage.maxFeePlaceholder`.toString()}
              />
            </Form.Item>
          </Col>
        </Row>
      )
    } else {
      return (
        <Row gutter={GUTTER}>
          <Col span={12}>
            <Form.Item
              name='receiverFixedFee'
              label={t`policy-management.depositManagement.modalContent.tabelModal.fixedFee`}
              rules={[
                {
                  required: true,
                  message:
                    t`policy-management.depositManagement.validateRequired`.toString()
                },
                () => ({
                  validator(_, value) {
                    if (value < 0 && value !== null) {
                      return Promise.reject(
                        t(
                          'policy-management.common.biggerThanZeroValidate'
                        ).toString()
                      )
                    } else {
                      return Promise.resolve()
                    }
                  }
                })
              ]}
            >
              <InputNumber
                // disabled={mode == viewMode.update}
                type='text'
                inputMode='numeric'
                style={{ width: '100%' }}
                formatter={moneyInputFormatter}
                onKeyDown={blockArrowValue}
                onKeyPress={blockLetterDecimal}
                placeholder={t`policy-management.depositManagement.modalContent.feePackage.fixedFeePlaceholder`.toString()}
              />
            </Form.Item>
          </Col>
        </Row>
      )
    }
  }

  return (
    <Form
      onFinish={onSubmit}
      layout='vertical'
      form={form}
      initialValues={{
        type: 'FLEXIBLE',
        transferorFlexibleFee: 0,
        transferorFixedFee: 0,
        transferorFeeMin: undefined,
        transferorFeeMax: undefined,
        receiverFlexibleFee: 0,
        receiverFixedFee: 0,
        receiverFeeMin: 0,
        receiverFeeMax: 0
      }}
    >
      <Row gutter={GUTTER}>
        <Col span={12}>
          <Form.Item
            name='transactionFrom'
            label={t`policy-management.depositManagement.modalContent.tabelModal.transactionFrom`}
            dependencies={['transactionTo']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const transactionTo = getFieldValue('transactionTo') || 0
                  console.log("test")
                  value = value || 0
                  if (value > transactionTo) {
                    return Promise.reject(
                      t`policy-management.common.validation.transactionFromBiggerValidate`
                    )
                  } else if (value === transactionTo) {
                    return Promise.reject(
                      t`policy-management.common.validation.transactionToSmallerValidate`
                    )
                  } else {
                    return Promise.resolve()
                  }
                }
              })
            ]}
          >
            <InputNumber
              type='text'
              inputMode='numeric'
              style={{ width: '100%' }}
              formatter={moneyInputFormatter}
              onKeyPress={blockLetterDecimal}
              onKeyDown={blockArrowValue}
              placeholder={t`policy-management.depositManagement.modalContent.feePackage.transactionFromPlaceholder`.toString()}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='transactionTo'
            label={t`policy-management.depositManagement.modalContent.tabelModal.transactionTo`}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const transactionFrom = getFieldValue('transactionFrom') || 0

                  value = value || 0
                  if (value < transactionFrom) {
                    return Promise.reject(
                      t`policy-management.depositManagement.transactionToValidate`
                    )
                  } else if (value === transactionFrom) {
                    return Promise.reject(
                      t`policy-management.common.validation.transactionFromBiggerValidate`
                    )
                  } else {
                    return Promise.resolve()
                  }
                }
              })
            ]}
          >
            <InputNumber
              type='text'
              inputMode='numeric'
              style={{ width: '100%' }}
              formatter={moneyInputFormatter}
              onKeyPress={blockLetterDecimal}
              placeholder={t`policy-management.depositManagement.modalContent.feePackage.transactionToPlaceholder`.toString()}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={GUTTER}>
        <Col span={12}>
          <Form.Item
            name='type'
            label={t`policy-management.depositManagement.modalContent.tabelModal.type`}
          >
            <Select
              options={FeeOptions}
              onChange={setType}
            />
          </Form.Item>
        </Col>
        <Col
          span={24}
          style={{ fontWeight: '600', marginBottom: '10px' }}
        >
          {t`policy-management.depositManagement.modalContent.tabelModal.onTransferor`}
        </Col>
        {type === 'FLEXIBLE' && (
          <Col span={12}>
            <Form.Item
              labelAlign='left'
              initialValue={0}
              name='transferorFlexibleFee'
              label={t`policy-management.depositManagement.modalContent.tabelModal.variableFee`}
              rules={[
                {
                  required: true,
                  message:
                    t`policy-management.common.validation.noTransactionFlexibleFeeValidate`.toString()
                },
                () => ({
                  validator(_, value) {
                    if (value < 0 || value > 100) {
                      return Promise.reject(
                        t(
                          'policy-management.depositManagement.transferorFlexibleFee'
                        ).toString()
                      )
                    } else {
                      return Promise.resolve()
                    }
                  }
                })
              ]}
            >
              <InputNumber
                precision={2}
                step={0.1}
                type='text'
                style={{ width: '100%' }}
                formatter={(value) => {
                  if (value) {
                    if (Number(value) > 100) {
                      form.setFieldsValue({
                        transferorFlexibleFee: 100
                      })
                      return '100%'
                    }
                  }
                  return `${value}%` ? `${value}%`.toString() : ''
                }}
                inputMode='numeric'
                onKeyDown={blockArrowValue}
                onKeyPress={blockLetterValue}
                placeholder={t`policy-management.depositManagement.modalContent.feePackage.variableFeePlaceholder`.toString()}
              />
            </Form.Item>
          </Col>
        )}
      </Row>
      {renderByType(type)}
      {module &&
        ![pageEnum.directDeposit, pageEnum.withdrawMoney].includes(module) && (
          <>
            <div
              style={{ fontWeight: '600', marginBottom: '10px' }}
            >{t`policy-management.depositManagement.modalContent.tabelModal.onReceiver`}</div>
            {type === 'FLEXIBLE' && (
              <Row gutter={GUTTER}>
                <Col span={12}>
                  <Form.Item
                    name='receiverFlexibleFee'
                    label={t`policy-management.depositManagement.modalContent.tabelModal.variableFee`}
                    rules={[
                      {
                        required: true,
                        message:
                          t`policy-management.depositManagement.validateRequired`.toString()
                      }
                    ]}
                  >
                    <InputNumber
                      type='text'
                      inputMode='numeric'
                      style={{ width: '100%' }}
                      formatter={(value) => {
                        if (value) {
                          if ((value as number) > 100) {
                            form.setFieldsValue({
                              receiverFlexibleFee: 100
                            })
                            return '100%'
                          }
                        }
                        return `${value}%` ? `${value}%`.toString() : ''
                      }}
                      onKeyDown={blockArrowValue}
                      onKeyPress={blockLetterDecimal}
                      placeholder={t`policy-management.depositManagement.modalContent.feePackage.variableFeePlaceholder`.toString()}
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}
            {renderByTypeReceiver()}
          </>
        )}
      <Row
        justify='end'
        gutter={GUTTER}
      >
        <Col>
          <Button
            className='mr-10'
            onClick={() => {
              onCancel()
            }}
          >
            {t`buttons.cancel`}
          </Button>
        </Col>
        <Col>
          <Button
            loading={isLoading}
            type='primary'
            htmlType='submit'
          >
            {t`buttons.create`}
          </Button>
        </Col>
      </Row>
    </Form>
  )
}
