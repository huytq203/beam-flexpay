import { Divider, Form, Input, InputNumber, Modal, Typography } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  open: boolean
  toggleOpen: (value: boolean) => void
}

export default React.memo<IProps>(({ open, toggleOpen }) => {
  const { t: trans } = useTranslation()

  return (
    <Modal
      centered
      okText={trans('arrears.title')}
      cancelText={trans('labels.back')}
      title={'Truy thu'}
      open={open}
      onCancel={() => toggleOpen(false)}
      width={800}
    >
      <Divider />
      <Form>
        <Form.Item
          labelAlign='left'
          labelCol={{ xs: 10 }}
          label={trans('arrears.account')}
        >
          <Typography.Text>097701642123</Typography.Text>
        </Form.Item>
        <Form.Item
          labelAlign='left'
          labelCol={{ xs: 10 }}
          label={trans('arrears.transaction')}
        >
          <Typography.Text>097701642123</Typography.Text>
        </Form.Item>
        <Form.Item
          labelAlign='left'
          labelCol={{ xs: 10 }}
          label={trans('arrears.receiveAccount')}
        >
          <Typography.Text>097701642123</Typography.Text>
        </Form.Item>
        <Form.Item
          labelAlign='left'
          labelCol={{ xs: 10 }}
          label={trans('arrears.transactionValue')}
        >
          <Typography.Text>097701642123</Typography.Text>
        </Form.Item>
        <Form.Item
          labelAlign='left'
          labelCol={{ xs: 10 }}
          name='amount'
          label={trans('arrears.amount')}
        >
          <InputNumber
            placeholder={trans('placeholders.amountOfMoney') || ''}
            className='w-100'
          />
        </Form.Item>
        <Form.Item
          labelAlign='left'
          labelCol={{ xs: 10 }}
          name='reason'
          label={trans('arrears.reason')}
        >
          <Input.TextArea placeholder={trans('placeholders.reason') || ''} />
        </Form.Item>
      </Form>
    </Modal>
  )
})
