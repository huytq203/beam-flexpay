import { ButtonComponent } from '@components/index'
import { FormInput } from '@components/form'
import { Col, Row } from 'antd'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Outlet } from 'react-router-dom'

const AuthLayout2 = () => {

    return (
        <>
            <div className="auth-page  ">
                <div className='auth-bg w-1/4 flex justify-center items-center '>
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export default AuthLayout2
