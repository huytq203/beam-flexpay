import { useAppSelector } from '@hooks/hook'
import { Col, Row } from 'antd'
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import './style.scss'

function AuthLayout() {
  const [title, setTitle] = useState<string>()
  const [description, setDescription] = useState<string>()

  const { accessToken } = useAppSelector((state) => state.auth)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (accessToken) {
      navigate('/')
    }
  }, [accessToken, navigate])

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/auth/login')
    }
  }, [location])

  useEffect(() => {
    window.events.on('auth-set-title', (_title: string) => setTitle(_title))
    window.events.on('auth-set-description', (_description: string) =>
      setDescription(_description)
    )
  }, [])

  return (
    <Row className='auth-page'>
      <Col
        lg={18}
        sm={0}
        
      >
        <div className='auth-bg-mask auth-mask-color' />
        <div className='auth-bg' />
        {/* <div className='auth-description'>
          <div className='m-auto'>
            <h1 className='t-white f-30'>{title}</h1>
            <p className='t-white'>{description}</p>
          </div>
        </div> */}
      </Col>
      <Col
        lg={6}
        sm={0}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Outlet />
      </Col>
    </Row>
  )
}

export default AuthLayout
