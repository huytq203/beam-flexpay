import { GUTTER } from '@constants/appConstant'
import {
  useGetDetailGroupPermissionQuery,
  useUpdateGroupPermissionMutation
} from '@services/apiGroupPermissionService'
import {
  GroupType,
  PermissionGroupType,
  PermissionsType
} from '@type/permission'
import { Button, Checkbox, Col, Form, Input, Row, notification } from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fakeData } from '../../admin-management/data'

interface IProps {
  onCancel: () => void
  id: string
  refetch: () => void
}

export const EditGroupPermission = ({ onCancel, id, refetch }: IProps) => {
  const {
    data,
    isSuccess,
    isLoading: loadingDetail
  } = useGetDetailGroupPermissionQuery(id)
  const [updateGroupPermission, { isSuccess: successUpdate, isLoading }] =
    useUpdateGroupPermissionMutation()

  const [listChecked, setListChecked] = useState<string[]>([])
  const [initListChecked, setInitListChecked] = useState<string[]>([])
  const [listUnchecked, setListUnchecked] = useState<string[]>([])
  const [finish, setFinish] = useState<boolean>(false)
  const [isEmpty, setIsEmpty] = useState<boolean>(false)

  const [form] = Form.useForm()

  useEffect(() => {
    if (isSuccess && !loadingDetail && data) {
      setListChecked(data?.permissions)
      setInitListChecked(data?.permissions)
      form.setFieldsValue({
        name: data.name,
        id: data.id
      })
    }
    setFinish(true)
  }, [data?.permissions])

  const { t } = useTranslation()

  const onChange = (
    e: CheckboxChangeEvent,
    arg1: PermissionsType,
    arg2: PermissionGroupType
  ) => {
    let dupListChecked = [...listChecked]
    let dupListUnchecked = [...listUnchecked]
    const findDeletedItem = listUnchecked.findIndex(
      (el: string) => el === arg1.permission
    )
    if (e.target.checked) {
      dupListChecked.push(arg1.permission)
      if (
        arg1.permission.includes('approve') ||
        arg1.permission.includes('update') ||
        arg1.permission.includes('delete') ||
        arg1.permission.includes('create')
      ) {
        const findViewItem = listUnchecked.findIndex(
          (el: string) => el === arg2.permissions[1].permission
        )
        const findItem = listChecked.find(
          (el: string) => el === arg2.permissions[1].permission
        )
        if (!findItem) {
          dupListChecked.push(arg2.permissions[1].permission)
        }
        if (findViewItem >= 0) {
          if (listUnchecked.length > 0) {
            dupListUnchecked.splice(findViewItem, 1)
          } else {
            dupListUnchecked = []
          }
        }
      }
      if (findDeletedItem >= 0) {
        if (listUnchecked.length > 0) {
          dupListUnchecked.splice(findDeletedItem, 1)
        } else {
          dupListUnchecked = []
        }
      }
      setListUnchecked(dupListUnchecked)
      setListChecked(dupListChecked)
    } else {
      const findItem = listChecked.findIndex(
        (el: string) => el === arg1.permission
      )
      const findInitItem = initListChecked.findIndex(
        (el: string) => el === arg1.permission
      )
      if (findInitItem >= 0) {
        dupListUnchecked.push(arg1.permission)
      }
      if (listChecked.length > 0) {
        dupListChecked.splice(findItem, 1)
      } else {
        dupListChecked = []
      }
      setListUnchecked(dupListUnchecked)
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
    let dupListUnchecked = [...listUnchecked]
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
      permissionsArr.map((el: string) => {
        const findIndex = dupListUnchecked.findIndex(
          (element: string) => element === el
        )
        if (findIndex >= 0) {
          if (dupListUnchecked.length > 0) {
            dupListUnchecked.splice(findIndex, 1)
          } else {
            dupListUnchecked = []
          }
        }
      })
      setListChecked(dupListChecked)
      setListUnchecked(dupListUnchecked)
    } else {
      const clearAllArr = listChecked.filter(
        (el: string) => !permissionsArr.includes(el)
      )
      const uncheckArr = initListChecked.filter((el: string) =>
        permissionsArr.includes(el)
      )
      dupListUnchecked = [...listUnchecked, ...uncheckArr]
      dupListChecked = clearAllArr
      setListUnchecked(dupListUnchecked)
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
    const payloadPermissionsArr = listChecked.filter(
      (el: string) => !initListChecked.includes(el)
    )
    const payload = {
      id,
      groupName: values.name,
      permissionNames: payloadPermissionsArr,
      permissionDeleteNames: listUnchecked
    }
    const data: any = await updateGroupPermission(payload)
    if (data.data.statusCode === 200) {
      notification.success({
        message: t('messages.successUpdateGroupPermission')
      })
    }
    setListChecked([])
    setInitListChecked([])
    setListUnchecked([])
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
        // key={crypto.randomUUID()}
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

  return (
    <Form
      onFinish={onSubmit}
      form={form}
    >
      <Form.Item
        name='id'
        label='ID'
        className='w-50 pt-10'
      >
        <Input
          readOnly
          bordered={false}
        />
      </Form.Item>
      <Form.Item
        name='name'
        label={t('labels.permissionGroupName')}
        className='w-50'
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
        <>
          {finish ? (
            <>
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
                          {/* {item.permissions.map(
                            (permissionItem: PermissionsType) => (
                              <Col
                                style={{ textAlign: 'center' }}
                                span={4}
                              >
                                {permissionItem ? (
                                  <Checkbox
                                    disabled={isDisable(item, permissionItem)}
                                    checked={isChecked(permissionItem)}
                                    onChange={(e) =>
                                      onChange(e, permissionItem, item)
                                    }
                                  />
                                ) : null}
                              </Col>
                            )
                          )} */}
                        </Row>
                      </Col>
                    </Row>
                  ))}
                </>
              ))}
            </>
          ) : null}
        </>
      </div>
      {isEmpty ? (
        <div style={{ fontWeight: 600, color: 'red', marginTop: 20 }}>
          {t('messages.accountPermissionsRequired')}
        </div>
      ) : null}
      <div style={{ textAlign: 'end', marginTop: 20 }}>
        <Button
          className='mr-10'
          onClick={() => {
            onCancel()
          }}
        >
          {t('custom-check-box.button.cancel')}
        </Button>
        <Button
          type='primary'
          htmlType='submit'
          loading={isLoading}
        >
          {t('custom-check-box.button.submit')}
        </Button>
      </div>
    </Form>
  )
}
