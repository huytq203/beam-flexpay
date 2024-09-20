import {
  EditOutlined,
  ExclamationCircleOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { GUTTER, SIZE_ICON } from '@constants/appConstant'
import { useAppDispatch, useAppSelector } from '@hooks/hook'
import { authService } from '@services/bankSerice'
import { logout } from '@slices/authSlice'
import { showPassword, showProfile } from '@utils/events'
import { Avatar, Col, Dropdown, MenuProps, Modal, Row, Typography } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'
import IAvatarDefault from '@assets/image/avatar_default.webp'
import { LockKey, SignOut, User, WarningCircle } from '@phosphor-icons/react'
import { COlOR } from './Navigation'
const { Text } = Typography

export default function NavProfile() {
  const dispatch = useAppDispatch()

  const { t: trans } = useTranslation()

  const { profile } = useAppSelector((state) => state.auth)

  const items: MenuProps['items'] = [
    {
      key: 'editProfile',
      label: trans('navigation.editProfile'),
      icon: <User size={SIZE_ICON} color={COlOR}/>
    },
    {
      label: trans('navigation.changePassword'),
      icon: <LockKey size={SIZE_ICON} color={COlOR}/>,
      key: 'changePassword'
    },
    {
      type: 'divider'
    },
    {
      label: trans('navigation.logout'),
      icon: <SignOut size={SIZE_ICON} color={COlOR}/>,
      key: 'logout'
    }
  ]

  const handleMenuClick: MenuProps['onClick'] = (event) => {
    switch (event.key) {
      case 'editProfile':
        showProfile()
        break
      case 'changePassword':
        showPassword()
        break
      case 'logout':
        signOut()
        break
    }
  }

  const menuProps = {
    items,
    onClick: handleMenuClick
  }

  const handleSignout = async () => {
    dispatch(authService.util.resetApiState())
    dispatch(logout())
  }

  const signOut = () => {
    Modal.confirm({
      title: trans('labels.logout'),
      icon: <WarningCircle size={24} color='#de831b' />,
      content: trans('labels.logoutDescription'),
      okText: trans('buttons.logout'),
      cancelText: trans('buttons.cancel'),
      onOk: handleSignout,
      centered: true
    })
  }

  return (
    <React.Fragment>
      <Dropdown
        placement='bottomLeft'
        menu={menuProps}
        trigger={['click']}
        arrow={{ pointAtCenter: true }}
      >
        <Row gutter={GUTTER}>
          <Col>
            <Text className='fw-500'>{profile.fullName}</Text>
          </Col>
          <Col>
            <Avatar src={<img src={IAvatarDefault} alt="avatar" />} size='large'>{profile.fullName?.charAt(0)}</Avatar>
          </Col>
        </Row>
      </Dropdown>
    </React.Fragment>
  )
}
