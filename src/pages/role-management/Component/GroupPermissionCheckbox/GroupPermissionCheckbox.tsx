import { GUTTER } from '@constants/appConstant'
import { useCreateGroupPermissionMutation } from '@services/apiGroupPermissionService'
import {
  GroupType,
  PermissionGroupType,
  PermissionsType
} from '@type/permission'
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Row,
  notification
} from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fakeData } from '../../admin-management/data'

interface IProps {
  onCancel: () => void
  refetch: () => void
}

export const GroupPermissionCheckbox = ({ onCancel, refetch }: IProps) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const [listChecked, setListChecked] = useState<string[]>([])
  const [isEmpty, setIsEmpty] = useState<boolean>(false)

  const [createGroupPermission, { isLoading, isSuccess }] =
    useCreateGroupPermissionMutation()

  const onChange = (
    e: CheckboxChangeEvent,
    arg1: PermissionsType,
    arg2: PermissionGroupType
  ) => {
    let dupListChecked = [...listChecked]
    if (e.target.checked) {
      dupListChecked.push(arg1.permission)
      if (
        arg1.permission.includes('approve') ||
        arg1.permission.includes('update') ||
        arg1.permission.includes('delete') ||
        arg1.permission.includes('create')
      ) {
        const findItem = listChecked.find(
          (el: string) => el === arg2.permissions[1].permission
        )
        if (!findItem) {
          dupListChecked.push(arg2.permissions[1].permission)
        }
      }
      setListChecked(dupListChecked)
    } else {
      const findItem = listChecked.findIndex(
        (el: string) => el === arg1.permission
      )
      if (listChecked.length > 0) {
        dupListChecked.splice(findItem, 1)
      } else {
        dupListChecked = []
      }
      setListChecked(dupListChecked)
    }
  }

  const isChecked = (permissionItem: PermissionsType) => {
    if (listChecked.includes(permissionItem.permission)) {
      return true
    } else false
  }

  const isCheckAll = (arg1: GroupType) => {
    const groups = arg1.groups
    let permissionsArr: string[] = []
    groups.map((el: PermissionGroupType) =>
      el.permissions.map((element: PermissionsType) => {
        permissionsArr.push(element.permission)
      })
    )
    const existedPermissions = permissionsArr.filter((el: string) =>
      listChecked.includes(el)
    )
    if (permissionsArr.length === existedPermissions.length) {
      return true
    } else return false
  }

  const onCheckAll = (e: CheckboxChangeEvent, arg1: GroupType) => {
    let dupListChecked = [...listChecked]
    const groups = arg1.groups
    let permissionsArr: string[] = []
    groups.map((el: PermissionGroupType) =>
      el.permissions.map((element: PermissionsType) => {
        permissionsArr.push(element.permission)
      })
    )
    const missingPermissions = permissionsArr.filter(
      (el: string) => !listChecked.includes(el)
    )
    if (e.target.checked && missingPermissions.length > 0) {
      dupListChecked = [...listChecked, ...missingPermissions]
      setListChecked(dupListChecked)
    } else {
      const clearAllArr = listChecked.filter(
        (el: string) => !permissionsArr.includes(el)
      )
      dupListChecked = clearAllArr
      setListChecked(dupListChecked)
    }
  }

  useEffect(() => {
    if (listChecked.length > 0) {
      setIsEmpty(false)
    }
  }, [listChecked])

  const onSubmit = async (values: any) => {
    if (listChecked.length === 0) {
      setIsEmpty(true)
      return
    }
    if (values.name.trim() === '') {
      form.setFields([
        {
          name: 'name',
          errors: [t`messages.required`.toString()]
        }
      ])
      return
    }
    const payload = {
      groupName: values.name,
      permissionNames: listChecked,
      permissionDeleteNames: []
    }
    const data: any = await createGroupPermission(payload)
    if (data.data.statusCode === 201) {
      notification.success({
        message: t('messages.successCreateGroupPermission')
      })
    }
    onCancel()
    refetch()
  }

  const isDisable = (
    group: PermissionGroupType,
    permissionItem: PermissionsType
  ) => {
    const isChecked = listChecked.find(
      (el: string) => el === permissionItem.permission
    )
    if (permissionItem.order === 2 && isChecked) {
      const permissionArr: string[] = []
      if (group) {
        group.permissions.map((el: PermissionsType) => {
          if (el && el.order === 1) {
            permissionArr.push(el.permission)
          }
          if (el && el.order === 3) {
            permissionArr.push(el.permission)
          }
          if (el && el.order === 4) {
            permissionArr.push(el.permission)
          }
          if (el && el.order === 5) {
            permissionArr.push(el.permission)
          }
        })
      }
      const existedPermission = listChecked.filter((el: string) =>
        permissionArr.includes(el)
      )
      if (existedPermission.length > 0) {
        return true
      }
      return false
    }
  }

  const renderByPosition = (item: PermissionGroupType) => {
    const _default = (
      <Col
        style={{ textAlign: 'center' }}
        span={4}
      ></Col>
    )
    let rendered = new Array(5).fill(_default)
    item.permissions.forEach((p, index) => {
      const key = p.permission.split(':')[1]
      const elementKey = crypto.randomUUID()
      const _item = (
        <Col
          key={elementKey}
          style={{ textAlign: 'center' }}
          span={4}
        >
          <Checkbox
            disabled={isDisable(item, p)}
            checked={isChecked(p)}
            onChange={(e) => onChange(e, p, item)}
          />
        </Col>
      )
      switch (key) {
        case 'approve':
          rendered[0] = _item
          break
        case 'view':
          rendered[1] = _item
          break
        case 'create':
          rendered[2] = _item
          break
        case 'update':
          rendered[3] = _item
          break
        case 'delete':
          rendered[4] = _item
          break
      }
    })
    return rendered
  }

  const handleClose = () => {
    if (form.isFieldsTouched()) {
      Modal.confirm({
        centered: true,
        title: t`labels.confirmClose`,
        content: t('labels.createPermissionCancel'),
        okText: t('buttons.cancel'),
        cancelText: t('buttons.no'),
        onOk: onCancel
      })
    } else {
      onCancel()
    }
  }

  return (
    <Form
      onFinish={onSubmit}
      form={form}
    >
      <Form.Item
        name='name'
        label={t('labels.permissionGroupName')}
        className='w-50 pt-10'
        rules={[
          {
            required: true,
            message: t('messages.isRequiredFormValidate').toString()
          },
          {
            min: 3,
            max: 250,
            message: t('messages.minMaxFormValidate', {
              min: 3,
              max: 250
            }).toString()
          }
        ]}
      >
        <Input placeholder={t('placeholders.permissionGroupName').toString()} />
      </Form.Item>
      <div style={{ maxHeight: 600, overflowY: 'scroll', overflowX: 'hidden' }}>
        <Row gutter={GUTTER}>
          <Col
            style={{ textAlign: 'center' }}
            span={12}
          >
            {t('custom-check-box.permission.permissionTitle')}
          </Col>
          <Col span={12}>
            <Row gutter={GUTTER}>
              <Col
                style={{ textAlign: 'center' }}
                span={4}
              >
                {t('custom-check-box.permission.approve')}
              </Col>
              <Col
                style={{ textAlign: 'center' }}
                span={4}
              >
                {t('custom-check-box.permission.view')}
              </Col>
              <Col
                style={{ textAlign: 'center' }}
                span={4}
              >
                {t('custom-check-box.permission.create')}
              </Col>
              <Col
                style={{ textAlign: 'center' }}
                span={4}
              >
                {t('custom-check-box.permission.update')}
              </Col>
              <Col
                style={{ textAlign: 'center' }}
                span={4}
              >
                {t('custom-check-box.permission.delete')}
              </Col>
            </Row>
          </Col>
        </Row>
        {fakeData.data.map((el: GroupType) => (
          <>
            <Row
              className='custom-row'
              gutter={GUTTER}
              style={{ marginBottom: 8, marginTop: 8 }}
            >
              <Col
                span={10}
                style={{ fontWeight: 600 }}
              >
                {el.name}
                <Checkbox
                  checked={isCheckAll(el)}
                  style={{ marginLeft: 5 }}
                  onChange={(e) => onCheckAll(e, el)}
                />
              </Col>
              <Col span={14}>
                <Row gutter={GUTTER}>
                  <Col
                    style={{ textAlign: 'center' }}
                    span={3}
                  >
                    {/* <Checkbox onChange={(e) => onCheckAll(e, el, 'approve')} /> */}
                  </Col>
                  <Col
                    style={{ textAlign: 'center' }}
                    span={3}
                  >
                    {/* <Checkbox onChange={(e) => onCheckAll(e, el, 'view')} /> */}
                  </Col>
                  <Col
                    style={{ textAlign: 'center' }}
                    span={3}
                  >
                    {/* <Checkbox onChange={(e) => onCheckAll(e, el, 'create')} /> */}
                  </Col>
                  <Col
                    style={{ textAlign: 'center' }}
                    span={3}
                  >
                    {/* <Checkbox onChange={(e) => onCheckAll(e, el, 'update')} /> */}
                  </Col>
                  <Col
                    style={{ textAlign: 'center' }}
                    span={3}
                  >
                    {/* <Checkbox onChange={(e) => onCheckAll(e, el, 'delete')} /> */}
                  </Col>
                </Row>
              </Col>
            </Row>
            {el.groups.map((item: PermissionGroupType) => (
              <Row
                className='custom-row'
                gutter={GUTTER}
              >
                <Col span={1} />
                <Col span={11}>{item.description}</Col>
                <Col span={12}>
                  <Row
                    className='custom-row'
                    gutter={GUTTER}
                  >
                    {renderByPosition(item)}
                    {/* {item.permissions.map((permissionItem: PermissionsType) => (
                      <Col
                        style={{ textAlign: 'center' }}
                        span={4}
                      >
                        {permissionItem ? (
                          <Checkbox
                            disabled={isDisable(item, permissionItem)}
                            checked={isChecked(permissionItem)}
                            onChange={(e) => onChange(e, permissionItem, item)}
                          />
                        ) : null}
                      </Col>
                    ))} */}
                  </Row>
                </Col>
              </Row>
            ))}
          </>
        ))}
      </div>
      {isEmpty ? (
        <div style={{ fontWeight: 600, color: 'red', marginTop: 20 }}>
          {t('messages.accountPermissionsRequired')}
        </div>
      ) : null}
      <Row
        className='mt-20'
        justify='end'
        gutter={GUTTER}
      >
        <Col>
          <Button onClick={handleClose}>
            {t('custom-check-box.button.cancel')}
          </Button>
        </Col>
        <Col>
          <Button
            type='primary'
            htmlType='submit'
            loading={isLoading}
          >
            {t('custom-check-box.button.submit')}
          </Button>
        </Col>
      </Row>
    </Form>
  )
}
