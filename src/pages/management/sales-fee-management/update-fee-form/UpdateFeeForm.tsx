import { useGetDetailSalelFeeQuery } from '@services/apiSaleFeeService'
import { viewMode } from '@type/customer'
import { ISaleFeeType, SaleFeeObject } from '@type/saleFeeType'
import { Button, Col, Form, Input, Row } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GUTTER } from '@constants/appConstant'
import { TimeFullFormat } from '@constants/datetime'
import { convertNumber, formatObject } from '@utils/helperFunctions'

interface IProps {
  mode?: viewMode
  onCancel: () => void
  refetch: () => void
  selectedId: string
  selectedItem: ISaleFeeType
}

type PayloadType = {
  applicableObject: string
  groupProductId: string
  variableFee: string | number
  fixedFee: string | number
  startDate: string
  endDate: string
  applicableAccountId?: string
  id: string
}

type SelectType = {
  value: string
  label: string
}

type DefaultValue = {
  defaultProductTypeValue: string
  defaultProductTypeLabel: string
  defaultProductValue: string
  defaultProductLabel: string
}

function UpdateSaleFeeForm({ onCancel, selectedId, refetch }: IProps) {
  const { t } = useTranslation()

  const [privateObject, setPrivateObject] = useState()
  const [form] = Form.useForm()

  const { data: detailSaleFee, isError } = useGetDetailSalelFeeQuery(selectedId)

  useEffect(() => {
    if (isError) {
      onCancel()
      refetch && refetch()
    }
  }, [isError])

  useEffect(() => {
    form.setFieldsValue({
      object: formatObject(detailSaleFee?.data?.applicableObject),
      productType: detailSaleFee?.data.product?.groupProduct?.productType?.name,
      product: detailSaleFee?.data.product?.groupProduct?.name,
      variableFee: `${detailSaleFee?.data?.variableFee}%`,
      fixedFee: convertNumber(detailSaleFee?.data?.fixedFee),
      intoMoney: convertNumber(detailSaleFee?.data?.intoMoney),
      childProduct: detailSaleFee?.data.product?.name,
      denominations: convertNumber(detailSaleFee?.data?.denominations),
      service:
        detailSaleFee?.data.product?.groupProduct?.productType?.service?.name,
      startDate: dayjs(detailSaleFee?.data?.startDate).format(TimeFullFormat),
      endDate: dayjs(detailSaleFee?.data?.endDate).format(TimeFullFormat)
    })
  }, [detailSaleFee?.data])

  useEffect(() => {
    if (detailSaleFee?.data?.applicableObject === SaleFeeObject.CUSTOMER_TYPE) {
      setPrivateObject(detailSaleFee?.data?.applicableObject)
      form.setFieldsValue({
        accountGroupId:
          detailSaleFee?.data?.accountGroup?.name || `${t`labels.nodata`}`
      })
    }
    if (
      detailSaleFee?.data?.applicableObject === SaleFeeObject.PRIVATE_ACCOUNT
    ) {
      setPrivateObject(detailSaleFee?.data?.applicableObject)
      form.setFieldsValue({
        applicableAccountId:
          detailSaleFee?.data?.applicableAccount?.accountNumber ||
          `${t`labels.nodata`}`
      })
    }
  }, [detailSaleFee?.data])

  return (
    <Form form={form}>
      <Row gutter={GUTTER}>
        <Col span={12}>
          <Form.Item
            name='object'
            label={t`management.sales-fee.object`}
          >
            <Input
              bordered={false}
              readOnly
            />
          </Form.Item>
        </Col>
        {privateObject === SaleFeeObject.CUSTOMER_TYPE && (
          <Col span={12}>
            <Form.Item
              name='accountGroupId'
              label={t`management.sales-fee.accountGroup`}
            >
              <Input
                bordered={false}
                readOnly
              />
            </Form.Item>
          </Col>
        )}

        {privateObject === SaleFeeObject.PRIVATE_ACCOUNT && (
          <Col span={12}>
            <Form.Item
              name='applicableAccountId'
              label={t`management.discount.account`}
            >
              <Input
                bordered={false}
                readOnly
              />
            </Form.Item>
          </Col>
        )}
        <Col span={12}>
          <Form.Item
            name='service'
            label={t`management.sales-fee.service`}
          >
            <Input
              bordered={false}
              readOnly
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='productType'
            label={t`management.sales-fee.productType`}
          >
            <Input
              bordered={false}
              readOnly
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='product'
            label={t`management.sales-fee.product`}
          >
            <Input
              bordered={false}
              readOnly
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='childProduct'
            label={t`management.sales-fee.childProduct`}
          >
            <Input
              bordered={false}
              readOnly
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='denominations'
            label={t`management.sales-fee.denominations`}
          >
            <Input
              bordered={false}
              readOnly
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='variableFee'
            label={t`management.sales-fee.variableFee`}
            initialValue={0}
          >
            <Input
              bordered={false}
              readOnly
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='fixedFee'
            label={t`management.sales-fee.fixedCharge`}
          >
            <Input
              bordered={false}
              readOnly
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='intoMoney'
            label={t`management.discount.current-charge`}
          >
            <Input
              bordered={false}
              readOnly
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('management.discount.form.time')}
            name='startDate'
          >
            <Input
              readOnly
              bordered={false}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('management.discount.end-time')}
            name='endDate'
          >
            <Input
              readOnly
              bordered={false}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row className='justify-end'>
        <Col>
          <Button
            type='primary'
            className='mr-10'
            onClick={onCancel}
          >{t`buttons.close`}</Button>
        </Col>
      </Row>
    </Form>
  )
}
export default UpdateSaleFeeForm
