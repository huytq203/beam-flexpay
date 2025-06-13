import { objectOptions, objectOptionsNotify } from '@constants/options'
import { useCreateNotifyMutation } from '@services/discountProductService'
import { ISaleFeeType } from '@type/saleFeeType'
import { formatObject } from '@utils/helperFunctions'
import { Button, DatePicker, Form, Input, notification, Select } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  onCancel: () => void
  selectedItem: ISaleFeeType
}
export const NotifyProductDiscountModal = ({
  selectedItem,
  onCancel
}: IProps) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [applyType, setApplyType] = useState()

  const [createNotify, { isLoading }] = useCreateNotifyMutation()

  const onSubmit = async (values: any) => {
    const data: any = await createNotify(selectedItem.id)
    if (data.data.statusCode === 201) {
      notification.success({
        message: t('messages.successCreateNotify')
      })
    }
    onCancel()
  }

  return (
    <Form
      layout='vertical'
      form={form}
      onFinish={onSubmit}
    >
      <Form.Item
        initialValue={t`management.discount.form.placeholders.title`.toString()}
        name='title'
        label={t`management.discount.form.title`.toString()}
      >
        <Select
          suffixIcon={null}
          disabled
          maxLength={255}
          // placeholder={t`management.discount.form.placeholders.title`.toString()}
        />
      </Form.Item>
      <Form.Item
        initialValue={selectedItem?.product?.name}
        name='childProduct'
        label={t`management.discount.form.child-product`.toString()}
      >
        <Select
          suffixIcon={null}
          disabled
          placeholder={t`management.discount.form.placeholders.childProductPlaceholder`.toString()}
        />
      </Form.Item>
      <Form.Item
        initialValue={formatObject(selectedItem?.applicableObject)}
        name='apply'
        label={t`management.discount.form.apply`.toString()}
      >
        <Select
          suffixIcon={null}
          disabled
          placeholder={t`management.discount.form.placeholders.apply`.toString()}
          options={objectOptionsNotify}
          onChange={(value) => setApplyType(value)}
        />
      </Form.Item>
      {applyType === 'personal' && (
        <Form.Item
          name='account'
          label={t`management.discount.form.account`.toString()}
          rules={[
            {
              required: true,
              message: t`management.discount.form.messages.account`.toString()
            }
          ]}
        >
          <Input
            placeholder={t`management.discount.form.placeholders.account`.toString()}
          />
        </Form.Item>
      )}
      <div className='text-end'>
        <Button
          className='mr-10'
          onClick={onCancel}
        >{t`buttons.cancel`}</Button>
        <Button
          type='primary'
          loading={isLoading}
          className='mr-10'
          htmlType='submit'
        >{t`buttons.create-notify`}</Button>
      </div>
    </Form>
  )
}
