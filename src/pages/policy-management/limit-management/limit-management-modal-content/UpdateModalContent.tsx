import { Button, Col, Form, Input, InputNumber, Row, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { blockLetterDecimal, moneyInputFormatter } from '@utils/helperFunctions'
import { useForm } from 'antd/es/form/Form'
import { GUTTER } from '@constants/appConstant'

type ModalContentType = {
  onCancel: () => void
}

export const UpdateModalContent = ({ onCancel }: ModalContentType) => {
  const { t: trans } = useTranslation()
  const [form] = useForm()

  const appliableObjectOptions = useMemo(
    () => [
      {
        value: 1,
        label: trans`policy-management.limitAndRegulations.system`.toString()
      },
      {
        value: 2,
        label:
          trans`policy-management.limitAndRegulations.accountType`.toString()
      },
      {
        value: 3,
        label:
          trans`policy-management.limitAndRegulations.accountGroup`.toString()
      }
    ],
    []
  )

  const limitTypeOptions = useMemo(
    () => [
      {
        value: 1,
        label: trans`policy-management.limitAndRegulations.minLimit`.toString()
      },
      {
        value: 2,
        label: trans`policy-management.limitAndRegulations.maxLimit`.toString()
      }
    ],
    []
  )

  const limitValueTypeOptions = useMemo(
    () => [
      {
        value: 1,
        label: trans`policy-management.limitAndRegulations.value`.toString()
      },
      {
        value: 2,
        label: trans`policy-management.limitAndRegulations.count`.toString()
      }
    ],
    []
  )

  return (
    <Form form={form}>
      <Row gutter={GUTTER}>
        <Col span={12}>
          <Form.Item
            name='limitName'
            rules={[
              {
                required: true,
                message:
                  trans`policy-management.limitAndRegulations.validate.required`.toString()
              }
            ]}
            labelCol={{ span: 9 }}
            wrapperCol={{ span: 15 }}
            labelAlign='left'
            label={trans`policy-management.limitAndRegulations.label.limitName`.toString()}
          >
            <Input
              placeholder={trans`policy-management.limitAndRegulations.placeholder.limitNamePlaceholder`.toString()}
            ></Input>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='appliableObject'
            rules={[
              {
                required: true,
                message:
                  trans`policy-management.limitAndRegulations.validate.required`.toString()
              }
            ]}
            labelCol={{ span: 9 }}
            wrapperCol={{ span: 15 }}
            labelAlign='left'
            label={trans`policy-management.limitAndRegulations.label.appliableObject`.toString()}
          >
            <Select
              placeholder={trans`policy-management.limitAndRegulations.placeholder.appliableObjectPlaceholder`.toString()}
            >
              {appliableObjectOptions.map((el) => (
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
      </Row>
      <Row gutter={GUTTER}>
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
            labelCol={{ span: 9 }}
            wrapperCol={{ span: 15 }}
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
            name='limitValueType'
            rules={[
              {
                required: true,
                message:
                  trans`policy-management.limitAndRegulations.validate.required`.toString()
              }
            ]}
            labelCol={{ span: 9 }}
            wrapperCol={{ span: 15 }}
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
      </Row>
      <Row gutter={GUTTER}>
        <Col span={12}>
          <Form.Item
            name='limitValue'
            labelCol={{ span: 9 }}
            wrapperCol={{ span: 15 }}
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
                  if (value < 0) {
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
              placeholder={trans`policy-management.limitAndRegulations.placeholder.limitValuePlaceholder`.toString()}
            ></InputNumber>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='timeLimit'
            rules={[
              {
                required: true,
                message:
                  trans`policy-management.limitAndRegulations.validate.required`.toString()
              }
            ]}
            labelCol={{ span: 9 }}
            wrapperCol={{ span: 15 }}
            labelAlign='left'
            label={trans`policy-management.limitAndRegulations.label.timeLimit`.toString()}
          >
            <Input
              placeholder={trans`policy-management.limitAndRegulations.placeholder.timeLimitPlaceholder`.toString()}
            ></Input>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={GUTTER}>
        <Col span={12}>
          <Form.Item
            name='appliableTime'
            rules={[
              {
                required: true,
                message:
                  trans`policy-management.limitAndRegulations.validate.required`.toString()
              }
            ]}
            labelCol={{ span: 9 }}
            wrapperCol={{ span: 15 }}
            labelAlign='left'
            label={trans`policy-management.limitAndRegulations.label.appliableTime`.toString()}
          >
            <Input
              placeholder={trans`policy-management.limitAndRegulations.placeholder.appliableTimePlaceholder`.toString()}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='transactionType'
            rules={[
              {
                required: true,
                message:
                  trans`policy-management.limitAndRegulations.validate.required`.toString()
              }
            ]}
            labelCol={{ span: 9 }}
            wrapperCol={{ span: 15 }}
            labelAlign='left'
            label={trans`policy-management.limitAndRegulations.label.transactionType`.toString()}
          >
            <Input
              placeholder={trans`policy-management.limitAndRegulations.placeholder.transactionTypePlaceholder`.toString()}
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
          >{trans`policy-management.limitAndRegulations.cancel`}</Button>
        </Col>
        <Col>
          <Button type='primary'>{trans`policy-management.limitAndRegulations.edit`}</Button>
        </Col>
      </Row>
    </Form>
  )
}
