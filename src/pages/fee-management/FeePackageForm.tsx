import { GUTTER } from '@constants/appConstant'
import { FeeOptions } from '@constants/options'
import {
  blockArrowValue,
  blockLetterDecimal,
  moneyInputFormatter
} from '@utils/helperFunctions'
import { Button, Col, Form, FormInstance, InputNumber, Row, Select } from 'antd'
import { t } from 'i18next'
import { useEffect, useState } from 'react'

type PackageProp<T> = {
  value: T
  setValue: (values: T) => void
  receiver: boolean
}

function FeePackageForm<T>({ receiver, setValue, value }: PackageProp<T>) {
  const [form] = Form.useForm()

  const [type, setType] = useState<'FLEXIBLE' | 'FIXED'>('FLEXIBLE')

  const onSubmit = () => {
    setValue(value)
  }

  useEffect(() => form.setFieldsValue(value), [value])

  const TypeRender = () => {
    let sender =
      type === 'FIXED' ? (
        <Row gutter={GUTTER}>
          <Col span={24}>
            <h3>{t`policy-management.depositManagement.modalContent.tableModal.onTransferor`}</h3>
          </Col>
          <Col span={12}>
            <Form.Item
              labelAlign='left'
              name='transferorFixedFee'
              label={t`policy-management.depositManagement.modalContent.tableModal.fixedFee`}
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
      ) : (
        <Row gutter={GUTTER}>
          <Col span={24}>
            <h3>{t`policy-management.depositManagement.modalContent.tableModal.onTransferor`}</h3>
          </Col>
          <Col span={12}>
            <Form.Item
              name='transferorFeeMin'
              label={t`policy-management.depositManagement.modalContent.tableModal.minFee`}
              rules={[
                {
                  required: true,
                  message:
                    t`policy-management.common.validation.noTransactionMinFeeValidate`.toString()
                },
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
              label={t`policy-management.depositManagement.modalContent.tableModal.maxFee`}
              rules={[
                {
                  required: true,
                  message:
                    t`policy-management.common.validation.noTransactionMaxFeeValidate`.toString()
                },
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
    const _receiver = receiver ? (
      type === 'FLEXIBLE' ? (
        <Row gutter={GUTTER}>
          <Col span={24}>
            <h3>{t`policy-management.depositManagement.modalContent.tableModal.onReceiver`}</h3>
          </Col>
          <Col span={12}>
            <Form.Item
              name='receiverFeeMin'
              label={t`policy-management.depositManagement.modalContent.tableModal.minFee`}
              rules={[
                {
                  required: true,
                  message:
                    t`policy-management.depositManagement.validateRequired`.toString()
                },
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
              label={t`policy-management.depositManagement.modalContent.tableModal.maxFee`}
              rules={[
                {
                  required: true,
                  message:
                    t`policy-management.depositManagement.validateRequired`.toString()
                },
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
      ) : (
        <Row gutter={GUTTER}>
          <Col span={24}>
            <h3>{t`policy-management.depositManagement.modalContent.tableModal.onReceiver`}</h3>
          </Col>
          <Col span={12}>
            <Form.Item
              name='receiverFixedFee'
              label={t`policy-management.depositManagement.modalContent.tableModal.fixedFee`}
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
    ) : (
      <></>
    )
    return [sender, _receiver]
  }

  return (
    <Form
      layout='vertical'
      onFinish={onSubmit}
      form={form}
      initialValues={{
        type: 'FLEXIBLE'
      }}
    >
      <Row gutter={GUTTER}>
        <Col span={12}>
          <Form.Item
            name='transactionFrom'
            label={t`policy-management.depositManagement.modalContent.tableModal.transactionFrom`}
            rules={[
              {
                required: true,
                message:
                  t`policy-management.common.validation.noTransactionFromValidate`.toString()
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value > getFieldValue('transactionTo') && value) {
                    form.setFields([
                      {
                        name: 'transactionTo',
                        errors: []
                      }
                    ])
                    return Promise.reject(
                      t`policy-management.common.validation.transactionFromBiggerValidate`
                    )
                  } else {
                    form.setFields([
                      {
                        name: 'transactionTo',
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
            label={t`policy-management.depositManagement.modalContent.tableModal.transactionTo`}
            rules={[
              {
                required: true,
                message:
                  t`policy-management.common.validation.noTransactionToValidate`.toString()
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value < getFieldValue('transactionFrom') && value) {
                    form.setFields([
                      {
                        name: 'transactionFrom',
                        errors: []
                      }
                    ])
                    return Promise.reject(
                      t`policy-management.common.validation.transactionToSmallerValidate`
                    )
                  } else {
                    form.setFields([
                      {
                        name: 'transactionFrom',
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
              style={{ width: '100%' }}
              formatter={moneyInputFormatter}
              onKeyPress={blockLetterDecimal}
              placeholder={t`policy-management.depositManagement.modalContent.feePackage.transactionToPlaceholder`.toString()}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col flex='50%'>
          <Form.Item
            name='type'
            label={t`policy-management.depositManagement.modalContent.tableModal.type`}
          >
            <Select
              options={FeeOptions}
              onChange={setType}
            />
          </Form.Item>
        </Col>
      </Row>

      {TypeRender()}
    </Form>
  )
}

export default FeePackageForm
