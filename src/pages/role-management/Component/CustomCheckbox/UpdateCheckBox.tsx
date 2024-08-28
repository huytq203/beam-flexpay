import { useViewDetailAccountQuery } from '@services/apiAdminAccountService'
import { AdminAccountData } from '@type/admin'
import {
  FormatPermissionType,
  GroupType,
  PermissionGroupType,
  PermissionsType
} from '@type/permission'
import { Checkbox, Col, Row, Spin } from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fakeData } from '../../admin-management/data'
import { GUTTER } from '@constants/appConstant'

type CustomCheckBoxType = {
  listIdChecked: number[]
  setListIdChecked: React.Dispatch<React.SetStateAction<number[]>>
  listIdUnchecked: number[]
  setListIdUnchecked: React.Dispatch<React.SetStateAction<number[]>>
  detailGroupPermission: FormatPermissionType | undefined
  loadingDetail: boolean
  successDetail: boolean
  isSelect: boolean
  listChecked: string[]
  setListChecked: React.Dispatch<React.SetStateAction<string[]>>
  setInitListChecked: React.Dispatch<React.SetStateAction<string[]>>
  initListChecked: string[]
  listUnchecked: string[]
  setListUnchecked: React.Dispatch<React.SetStateAction<string[]>>
}

export const CustomUpdateCheckBox = ({
  listIdChecked,
  setListIdChecked,
  listIdUnchecked,
  setListIdUnchecked,
  detailGroupPermission,
  successDetail,
  loadingDetail,
  isSelect,
  listUnchecked,
  setListUnchecked,
  setInitListChecked,
  initListChecked,
  listChecked,
  setListChecked
}: CustomCheckBoxType) => {
  const { t } = useTranslation()

  useEffect(() => {
    if (successDetail && !loadingDetail && detailGroupPermission) {
      setListChecked(detailGroupPermission?.permissions)
      setInitListChecked(detailGroupPermission?.permissions)
      setListIdChecked(detailGroupPermission?.permissionsId)
    }
  }, [detailGroupPermission?.permissions])

  const onChange = (
    e: CheckboxChangeEvent,
    arg1: PermissionsType,
    arg2: PermissionGroupType
  ) => {
    let dupListChecked = [...listChecked]
    let dupListIdChecked = [...listIdChecked]
    let dupListUnchecked = [...listUnchecked]
    let dupListIdUnchecked = [...listIdUnchecked]
    const findDeletedItem = listUnchecked.findIndex(
      (el: string) => el === arg1.permission
    )
    const findDeletedItemId = listIdUnchecked.findIndex(
      (el: number) => el === arg1.realId
    )
    if (e.target.checked) {
      dupListChecked.push(arg1.permission)
      dupListIdChecked.push(arg1.realId)
      if (
        arg1.permission.includes('approve') ||
        arg1.permission.includes('update') ||
        arg1.permission.includes('delete') ||
        arg1.permission.includes('create')
      ) {
        const findViewItem = listUnchecked.findIndex(
          (el: string) => el === arg2.permissions[1].permission
        )
        const findViewItemId = listIdUnchecked.findIndex(
          (el: number) => el === arg2.permissions[1].realId
        )
        const findItem = listChecked.find(
          (el: string) => el === arg2.permissions[1].permission
        )
        if (!findItem) {
          dupListChecked.push(arg2.permissions[1].permission)
          dupListIdChecked.push(arg2.permissions[1].realId)
        }
        if (findViewItem >= 0 && findViewItemId >= 0) {
          if (listUnchecked.length > 0 && listIdUnchecked.length > 0) {
            dupListUnchecked.splice(findViewItem, 1)
            dupListIdUnchecked.splice(findViewItemId, 1)
          } else {
            dupListUnchecked = []
            dupListIdUnchecked = []
          }
        }
      }
      if (findDeletedItem >= 0 && findDeletedItemId >= 0) {
        if (listUnchecked.length > 0 && listIdUnchecked.length > 0) {
          dupListUnchecked.splice(findDeletedItem, 1)
          dupListIdUnchecked.splice(findDeletedItemId, 1)
        } else {
          dupListUnchecked = []
          dupListIdUnchecked = []
        }
      }
      setListIdUnchecked(dupListIdUnchecked)
      setListIdChecked(dupListIdChecked)
      setListUnchecked(dupListUnchecked)
      setListChecked(dupListChecked)
    } else {
      const findItem = listChecked.findIndex(
        (el: string) => el === arg1.permission
      )
      const findItemId = listIdChecked.findIndex(
        (el: number) => el === arg1.realId
      )
      const findInitItem = initListChecked.findIndex(
        (el: string) => el === arg1.permission
      )
      if (findInitItem >= 0) {
        dupListUnchecked.push(arg1.permission)
        dupListIdUnchecked.push(arg1.realId)
      }
      if (listChecked.length > 0) {
        dupListChecked.splice(findItem, 1)
        dupListIdChecked.splice(findItemId, 1)
      } else {
        dupListChecked = []
        dupListIdChecked = []
      }
      setListIdUnchecked(dupListIdUnchecked)
      setListUnchecked(dupListUnchecked)
      setListChecked(dupListChecked)
      setListIdChecked(dupListIdChecked)
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
    console.log('existedPermissions', existedPermissions)
    console.log('permissionsArr', permissionsArr)
    if (permissionsArr.length === existedPermissions.length) {
      return true
    } else return false
  }

  const onCheckAll = (e: CheckboxChangeEvent, arg1: GroupType) => {
    let dupListChecked = [...listChecked]
    let dupListCheckedId = [...listIdChecked]
    let dupListUncheckedId = [...listIdUnchecked]
    let dupListUnchecked = [...listUnchecked]
    const groups = arg1.groups
    let permissionsArr: string[] = []
    let permissionsArrId: number[] = []
    groups.map((el: PermissionGroupType) =>
      el.permissions.map((element: PermissionsType) => {
        permissionsArr.push(element.permission)
      })
    )
    groups.map((el: PermissionGroupType) =>
      el.permissions.map((element: PermissionsType) => {
        permissionsArrId.push(element.realId)
      })
    )
    const missingPermissionsId = permissionsArrId.filter(
      (el: number) => !listIdChecked.includes(el)
    )
    const missingPermissions = permissionsArr.filter(
      (el: string) => !listChecked.includes(el)
    )
    if (
      e.target.checked &&
      missingPermissions.length > 0 &&
      missingPermissionsId.length > 0
    ) {
      dupListChecked = [...listChecked, ...missingPermissions]
      dupListCheckedId = [...listIdChecked, ...missingPermissionsId]
      permissionsArrId.map((el: number) => {
        const findIndex = dupListUncheckedId.findIndex(
          (element: number) => element === el
        )
        if (findIndex >= 0) {
          if (dupListUncheckedId.length > 0) {
            dupListUncheckedId.splice(findIndex, 1)
          } else {
            dupListUncheckedId = []
          }
        }
      })
      permissionsArr.map((el: string) => {
        const findIndex = dupListUnchecked.findIndex(
          (element: string) => element === el
        )
        if (findIndex >= 0) {
          if (dupListUnchecked.length >= 0) {
            dupListUnchecked.splice(findIndex, 1)
          } else {
            dupListUnchecked = []
          }
        }
      })
      setListUnchecked(dupListUnchecked)
      setListIdUnchecked(dupListUncheckedId)
      setListIdChecked(dupListCheckedId)
      setListChecked(dupListChecked)
    } else {
      const clearAllArr = listChecked.filter(
        (el: string) => !permissionsArr.includes(el)
      )
      const clearAllArrId = listIdChecked.filter(
        (el: number) => !permissionsArrId.includes(el)
      )
      const findExisted = permissionsArr.filter((el: string) =>
        initListChecked.includes(el)
      )
      const findExistedId = permissionsArrId.filter((el: number) =>
        listIdChecked.includes(el)
      )
      dupListUnchecked = [...listUnchecked, ...findExisted]
      dupListUncheckedId = [...listIdUnchecked, ...findExistedId]
      dupListCheckedId = clearAllArrId
      dupListChecked = clearAllArr
      setListIdUnchecked(dupListUncheckedId)
      setListUnchecked(dupListUnchecked)
      setListIdChecked(dupListCheckedId)
      setListChecked(dupListChecked)
    }
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
    <>
      {!isSelect ? (
        <div>
          <Row
            gutter={GUTTER}
            style={{ position: 'sticky' }}
          >
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
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <Spin />
        </div>
      )}
    </>
  )
}
