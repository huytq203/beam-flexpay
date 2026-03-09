import { GUTTER } from '@constants/appConstant'
import { TimeFullFormat } from '@constants/datetime'
import { useLazyGetDetailAccountGroupQuery } from '@services/apiAccountGroup'
import { useLazyGetCustomerQuery } from '@services/customerService'
import {
  useUpdateDiscountProductMutation,
  useViewDiscountProductQuery
} from '@services/discountProductService'
import { ISaleFeeType, SaleFeeObject } from '@type/saleFeeType'

import {
  blockLetterDecimal,
  convertNumber,
  formatObject,
  moneyInputFormatter
} from '@utils/helperFunctions'
import { Button, Col, Form, Input, InputNumber, Row, notification } from 'antd'
import { useForm } from 'antd/es/form/Form'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type ProductDiscountProps = {
  open: boolean
  onClose: () => void
  id: string
  selectedItem: ISaleFeeType
}
export const ViewProductDiscountModal = (props: ProductDiscountProps) => {
  const { onClose, id, selectedItem } = props
  const { t } = useTranslation()
  const [form] = useForm()

  const { data: detailData } = useViewDiscountProductQuery(id)

  const [privateObject, setPrivateObject] = useState()

  const [, setSelectedId] = useState<number | string>('')
  const [, setSelectedProductTypeId] = useState<number | string>('')
  const [, setSelectedStartDate] = useState<boolean>(true)
  const [, setIntoMoney] = useState<number>(0)

  const [updateDiscountProduct, isLoadingUpdate] =
    useUpdateDiscountProductMutation()

  const [triggerGetCustomer, { data: Customer }] = useLazyGetCustomerQuery()

  const [trigggerAccountGroup, { data: Accountgroup }] =
    useLazyGetDetailAccountGroupQuery()

  const handleSubmit = async (value: any) => {
    if (value.intoMoney < 0) {
      form.setFields([
        {
          name: 'intoMoney',
          errors: [t('messages.smallerThanZeroValidate')]
        }
      ])
      return
    }
    const payload = {
      id: id,
      applicableObject: value.applicableObject,
      groupProductId:
        typeof value.groupProductId === 'string'
          ? detailData?.data?.groupProduct?.id
          : value.groupProductId,
      denominations: Number(value.denominations),
      discount: value.discount > 100 ? 100 : value.discount,
      fixedFee: Number(value.fixedFee),
      startDate: value.startDate.toISOString(),
      endDate: value.endDate.toISOString()
    }
    const result: any = await updateDiscountProduct(payload)
    if (result?.data) {
      notification.success({ message: t('messages.successUpdateNotify') })
      onClose()
    }
  }

  const onValueChanges = (changedValues: any, allValues: any) => {
    const discount = allValues.discount > 100 ? 100 : allValues.discount
    if (allValues.denominations && discount && allValues.fixedFee) {
      const value =
        allValues.denominations - (discount / 100 + allValues.fixedFee)
      setIntoMoney(value)
      form.setFieldsValue({
        intoMoney: value
      })
    } else {
      setIntoMoney(0)
      form.setFieldsValue({
        intoMoney: 0
      })
    }
  }

  useEffect(() => {
    if (detailData) {
      if (detailData?.data?.startDate) {
        setSelectedStartDate(false)
      }
      setSelectedId(detailData?.data?.groupProduct?.productType?.service?.name)
      setSelectedProductTypeId(
        detailData?.data?.groupProduct?.productType?.name
      )
      form.setFieldsValue({
        id: detailData?.data?.id,
        applicableObject: formatObject(detailData?.data?.applicableObject),
        service:
          detailData?.data?.product?.groupProduct?.productType?.service?.name,
        productType: detailData?.data?.product?.groupProduct?.productType?.name,
        groupProductId: detailData?.data?.product?.groupProduct?.name,
        childProduct: detailData?.data?.product?.name,
        denominations: convertNumber(detailData?.data?.denominations),
        discount: `${detailData?.data?.discount}`,
        fixedFee: convertNumber(detailData?.data?.fixedFee),
        intoMoney: convertNumber(detailData?.data?.intoMoney),
        startDate: dayjs(detailData?.data?.startDate).format(TimeFullFormat),
        endDate: dayjs(detailData?.data?.endDate).format(TimeFullFormat)
      })
    }
  }, [detailData])

  useEffect(() => {
    if (detailData?.data.applicableObject === SaleFeeObject.CUSTOMER_TYPE) {
      trigggerAccountGroup(selectedItem?.accountGroupId)
      setPrivateObject(detailData?.data?.applicableObject)
      form.setFieldsValue({
        accountGroupId: Accountgroup?.name || `${t`labels.nodata`}`
      })
    }
    if (detailData?.data.applicableObject === SaleFeeObject.PRIVATE_ACCOUNT) {
      triggerGetCustomer(selectedItem.applicableAccountId.toString())
      setPrivateObject(detailData?.data?.applicableObject)
      form.setFieldsValue({
        applicableAccountId:
          Customer?.data?.accountNumber || `${t`labels.nodata`}`
      })
    }
  }, [detailData?.data, Accountgroup, Customer])

  return (
    <Form
      form={form}
      layout='horizontal'
      className='w-100'
      onFinish={handleSubmit}
      onValuesChange={onValueChanges}
    >
      <Row
        className='w-100'
        gutter={GUTTER}
      >
        <Col span={12}>
          <Form.Item
            name='applicableObject'
            label={t`management.discount.applicable-object`}
          >
            <Input
              readOnly
              bordered={false}
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
              label={t`management.sales-fee.account`}
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
            label={t`management.discount.service`}
          >
            <Input
              readOnly
              bordered={false}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='productType'
            label={t`management.discount.product-type`}
          >
            <Input
              readOnly
              bordered={false}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='groupProductId'
            label={t`management.discount.product`}
            initialValue={detailData?.data?.groupProduct?.id}
          >
            <Input
              readOnly
              bordered={false}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='childProduct'
            label={t`management.discount.childProduct`}
          >
            <Input
              readOnly
              bordered={false}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='denominations'
            label={t`management.discount.cost`}
            initialValue={detailData?.data?.denominations}
          >
            <Input
              readOnly
              bordered={false}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='discount'
            label={t`management.discount.discount`}
            initialValue={detailData?.data?.discount}
          >
            <InputNumber
              readOnly
              bordered={false}
              formatter={(value, event) => {
                if (value) {
                  if (+value > 100) {
                    form.setFieldsValue({
                      discount: 100
                    })
                    return '100%'
                  }
                }
                return `${value}%` ? `${value}%`.toString() : ''
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='fixedFee'
            label={t`management.discount.fixed-charge`}
            initialValue={detailData?.data?.fixedFee}
          >
            <InputNumber
              readOnly
              bordered={false}
              onKeyPress={blockLetterDecimal}
              placeholder={
                t(
                  'management.discount.form.placeholders.fixed-charge'
                ) as string
              }
              formatter={moneyInputFormatter}
              className='w-100'
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='intoMoney'
            label={t`management.discount.current-charge`}
          >
            <InputNumber
              readOnly
              bordered={false}
              className='w-100'
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
      <div className='text-end'>
        <Button
          className='mr-10'
          onClick={onClose}
        >{t`buttons.back`}</Button>
      </div>
    </Form>
  )
}
