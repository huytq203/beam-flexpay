import { GUTTER, SIZE_ICON } from '@constants/appConstant'
import { useAppDispatch, useAppSelector } from '@hooks/hook'
import { logout } from '@slices/authSlice'
import { showPassword, showProfile } from '@utils/events'
import { Avatar, Col, Dropdown, MenuProps, Row, Typography } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { COlOR } from './Navigation'
import {
  GearSixIcon,
  LockKeyIcon,
  SignOutIcon,
  UserIcon,
  WarningCircleIcon
} from '@phosphor-icons/react/dist/ssr'
import { CapySettingsDialog } from '@components/capy/CapySettingsDialog'
import { useCapySettings } from '@components/capy/hooks/useCapySettings'
import DialogModal from '@components/ui/dialogModal-component'
import { useLogoutMutation } from '@services/authEndpoints'
import {
  getRefreshTokenCookie,
  removeRefreshTokenCookie
} from '@configs/fetchBaseQuery.types'

const IAvatarDefault = '/images/assets/image/avatar_default.webp'
const { Text } = Typography

export default function NavProfile() {
  const dispatch = useAppDispatch()
  const _navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { available: canOpenSettings } = useCapySettings()

  const [logoutApi] = useLogoutMutation()

  const { t: trans } = useTranslation()

  const { profile } = useAppSelector((state) => state.auth)

  const items: MenuProps['items'] = [
    {
      key: 'editProfile',
      label: trans('navigation.editProfile'),
      icon: (
        <UserIcon
          size={SIZE_ICON}
          color={COlOR}
        />
      )
    },
    {
      label: trans('navigation.changePassword'),
      icon: (
        <LockKeyIcon
          size={SIZE_ICON}
          color={COlOR}
        />
      ),
      key: 'changePassword'
    },
    ...(canOpenSettings
      ? [
          {
            label: trans('navigation.settings'),
            icon: (
              <GearSixIcon
                size={SIZE_ICON}
                color={COlOR}
              />
            ),
            key: 'settings'
          }
        ]
      : []),
    {
      type: 'divider'
    },
    {
      label: trans('navigation.logout'),
      icon: (
        <SignOutIcon
          size={SIZE_ICON}
          color={COlOR}
        />
      ),
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
      case 'settings':
        setSettingsOpen(true)
        break
      case 'logout':
        setOpen(true)
        break
    }
  }

  const menuProps = {
    items,
    onClick: handleMenuClick
  }

  const handleSignout = async () => {
    try {
      const refreshToken = getRefreshTokenCookie()
      if (refreshToken) {
        await logoutApi({ refreshToken }).unwrap()
      }
    } catch {
    } finally {
      removeRefreshTokenCookie()
      dispatch(logout())
      // window.location.href = '/auth/login';
    }
  }

  return (
    <React.Fragment>
      <Row
        gutter={GUTTER}
        className='items-center'
      >
        <Col>
          <Text className='font-semibold '>
            {profile.fullName || profile.email}
          </Text>
        </Col>
        <Col>
          <Dropdown
            placement='bottomRight'
            menu={menuProps}
            trigger={['click']}
            arrow={{ pointAtCenter: true }}
          >
            <Avatar
              className='cursor-pointer'
              src={
                <img
                  src={IAvatarDefault}
                  alt='avatar'
                />
              }
              size='large'
            >
              {profile.fullName?.charAt(0)}
            </Avatar>
          </Dropdown>
        </Col>
      </Row>
      <CapySettingsDialog
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
      />
      <DialogModal
        title={
          <div className='flex items-center gap-2'>
            <WarningCircleIcon
              size={24}
              color='#de831b'
            />
            <span>{trans('labels.logout')}</span>
          </div>
        }
        content={trans('labels.logoutDescription')}
        okText={trans('buttons.logout')}
        cancelText={trans('buttons.cancel')}
        onOk={handleSignout}
        open={open}
        onCancel={() => setOpen(false)}
      />
    </React.Fragment>
  )
}
