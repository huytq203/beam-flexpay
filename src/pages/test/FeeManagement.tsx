import { Input, SelectInput } from '@components/common'
import { Card } from 'antd'
import React from 'react'

const FeeManagement = () => {
    return (
        <>
            <div className='flex flex-col gap-3'>
                <Card>
                    <div className="">
                        <label htmlFor="">Tên chính sách</label>
                        <Input placeholder="nhập tên chính sách..." />
                    </div>
                    <div className="">
                        <label htmlFor="">Tên chính sách</label>
                        <SelectInput data={[
                            {label:'Tất cả dịch vụ',value:0},
                            {label:'Tất cả dịch vụ',value:1},
                            {label:'Tất cả dịch vụ',value:2}
                        ]}/>
                    </div>
                </Card>

                <Card>

                </Card>

            </div>
        </>
    )
}

export default FeeManagement