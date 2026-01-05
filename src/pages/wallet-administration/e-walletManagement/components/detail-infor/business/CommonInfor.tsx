import { CardComponent } from '@components/common'
import React from 'react'


const InforUser = () => {
    return (
        <></>
    )
}

const InforEwallet = () => {
    return (<></>)
}
const CommonInfor = () => {
    return (
        <div>
            <CardComponent content={<InforUser />} />
            <CardComponent content={<InforEwallet />} />
        </div>
    )
}

export default CommonInfor