import { CardComponent } from '@components/common'
import React from 'react'
import HistoryLogin from './components/HistoryLogin'
import AuthMethod from './components/AuthMethod'

const Security = () => {
    return (
        <div className='flex mt-3 gap-3'>
            <CardComponent className='flex-1' content={
                <>
                    <AuthMethod />
                </>
            } />
            <CardComponent className='flex-1' content={
                <>
                    <HistoryLogin />
                </>
            } />

        </div>
    )
}

export default Security