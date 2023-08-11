import { dataPermissionListArray, dataRolePermission } from '@constants/options'
import { Button, Checkbox, Col, Form, Input, Row } from 'antd'
import { CheckboxValueType } from 'antd/es/checkbox/Group'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  onCancel: () => void
}

function CreateGroupPermission({ onCancel }: IProps) {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const CheckboxGroup = Checkbox.Group
  const [checkedList, setCheckedList] = useState<CheckboxValueType[]>()
  const [indeterminate, setIndeterminate] = useState(true)
  const [checkAll, setCheckAll] = useState(false)

  const onSubmit = (values: any) => {
  }

  const onChange = (list: CheckboxValueType[]) => {
    setCheckedList(list)
    setIndeterminate(!!list.length && list.length < dataRolePermission.length)
    setCheckAll(list.length === dataRolePermission.length)
  }

  return (
    <Form
      layout='vertical'
      form={form}
      onFinish={onSubmit}
    >
      <>
        <Form.Item
          name='name'
          label={t('labels.permissionGroupName')}
          className='w-50'
        >
          <Input
            placeholder={t('placeholders.permissionGroupName').toString()}
          />
        </Form.Item>
        <p>{t('ekyc.functions')}</p>
        <Row className='ml-30 mt-10'>
          <Col span={9}>
            <p>{t('ekyc.functions')}</p>
          </Col>
          {dataPermissionListArray.map((itemPermission) => (
            <Col
              span={3}
              className='text-center'
              style={{ paddingLeft: '45px' }}
              key={itemPermission.id}
            >
              {itemPermission.name}
            </Col>
          ))}
        </Row>
        {dataRolePermission.map((item) => (
          <Row
            className='mt-10'
            key={item.id}
          >
            <Col span={9}>
              <p style={{ paddingLeft: '30px' }}>{item.name}</p>
            </Col>
            <CheckboxGroup onChange={onChange}>
              {item.permissions.map((item) => (
                <Checkbox value={item} />
              ))}
            </CheckboxGroup>
          </Row>
        ))}
        <div className='text-end mt-50'>
          <Button
            type='primary'
            ghost
            className='mr-10'
            onClick={onCancel}
          >{t`buttons.cancel`}</Button>
          <Button
            type='primary'
            className='mr-10'
            htmlType='submit'
          >{t`buttons.save`}</Button>
        </div>
      </>
    </Form>
  )
}
export default CreateGroupPermission
