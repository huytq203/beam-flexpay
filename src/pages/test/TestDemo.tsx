import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { PolicySchema, PolicyType } from "./components/ZodValidate";
import {
    DateInput,
    SelectInput,
    TextArea,
    Input,
    ModalComponent,
    ButtonComponent,
    Table
} from '@components/common'
import FeeComponent from './components/FeeComponent'
import dayjs from 'dayjs'
import FormAddFee from '@pages/test/components/FormAddFee'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const TestDemo = () => {
    // Mock API trigger cho CustomSelect
    const [open, setOpen] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)
    const [modalText, setModalText] = useState('Content of the modal')


    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<PolicyType>({
        resolver: zodResolver(PolicySchema),
        defaultValues: {
            name: "",
            description: "",
            priority: "",
            status: "",
            startDate: "",
            endDate: ""
        }
    });

    const onSubmit = (data: PolicyType) => {
        console.log("🎉 FORM DATA:", data);
    };



    const handleOk = () => {
        setModalText('The modal will be closed after two seconds')
        setConfirmLoading(true)
        setTimeout(() => {
            setOpen(false)
            setConfirmLoading(false)
        }, 2000)
    }

    const handleCancel = () => {
        setOpen(false)
    }
    const dataSource = [
        {
            namePolicy: '1',
            typeSevice: '0 VNĐ',
            domain: '100,000,000 VNĐ',
            validityPeriod: '1.1%',
            status: 'Min: 5,000',
        
        },
        {
            namePolicy: '1',
            typeSevice: '0 VNĐ',
            domain: '100,000,000 VNĐ',
            validityPeriod: '1.1%',
            status: 'Min: 5,000',
        
        },
        {
            namePolicy: '1',
            typeSevice: '0 VNĐ',
            domain: '100,000,000 VNĐ',
            validityPeriod: '1.1%',
            status: 'Min: 5,000',
        
        },
        {
            namePolicy: '1',
            typeSevice: '0 VNĐ',
            domain: '100,000,000 VNĐ',
            validityPeriod: '1.1%',
            status: 'Min: 5,000',
        
        },
        {
            namePolicy: '1',
            typeSevice: '0 VNĐ',
            domain: '100,000,000 VNĐ',
            validityPeriod: '1.1%',
            status: 'Min: 5,000',
        },

    ]

    const columns = [
        {
            title: 'Tên Chính sách',
            dataIndex: 'namePolicy',
            key: 'namePolicy',
            className: ' border py-0',

        },
        {
            title: 'Loại Dịch vụ',
            dataIndex: 'typeSevice',
            key: 'typeSevice',
            className: ' border border-l-0 py-0',

        },
        {
            title: 'Domain',
            dataIndex: 'domain',
            key: 'domain',
            className: ' border border-l-0 py-0',


        },
        {
            title: 'Thời gian hiệu lực',
            dataIndex: 'validityPeriod',
            key: 'validityPeriod',
            className: ' border border-l-0 py-0',

        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            className: ' border border-l-0 py-0',

        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            className: ' border border-l-0 py-0',
            render: () => (
                <div className="flex gap-3 justify-center items-center">
                    <EditOutlined className="text-blue-500 cursor-pointer text-lg" />
                    <DeleteOutlined className="text-red-500 cursor-pointer text-lg" />
                </div>
            )

        }
    ]


    return (
        <div>
            <div className='flex flex-col justify-center item-center  mx-5 my-5 gap-2'>
                <div className='item1 bg-white rounded p-3 '>
                    <div className='header'>
                        <p className='text-lg font-semibold'>1. Thông tin chung</p>
                        <div className='content'>
                            <form id="policyForm" onSubmit={handleSubmit(onSubmit)}>
                                <div className='grid grid-cols-12 gap-2'>
                                    <div className='col-span-12 flex flex-col'>
                                        <label htmlFor=''>Tên chính sách phí</label>
                                        <Controller
                                            name="name"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}   // đảm bảo có value, onChange, onBlur
                                                    placeholder="Nhập tên chính sách..."
                                                />
                                            )}
                                        />
                                        {/* <Input    placeholder="Nhập tên chính sách..."   onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue("name", e.target.value)} /> */}
                                        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                                    </div>
                                    <div className='col-span-6 flex flex-col'>
                                        <label htmlFor=''>Hiệu lực từ</label>
                                        <DateInput
                                            picker={'date'}
                                            onChange={(d, s) => setValue("startDate", s as string)}
                                        />
                                        {errors.startDate && (
                                            <p className="text-red-500">{errors.startDate.message}</p>
                                        )}
                                    </div>
                                    <div className='col-span-6 flex flex-col'>
                                        <label htmlFor=''>Hiệu lực đến</label>
                                        <DateInput
                                            onChange={(d, s) => setValue('endDate', s as string)}
                                            picker={'date'}
                                        />
                                        {(errors.endDate && (<p className="text-red-500">{errors.endDate.message}</p>))}
                                    </div>
                                    <div className='col-span-6 flex flex-col'>
                                        <label htmlFor=''>Mức độ ưu tiên</label>
                                        <SelectInput
                                            data={[
                                                { label: "Cao", value: "high" },
                                                { label: "Trung bình", value: "medium" },
                                                { label: "Thấp", value: "low" },
                                            ]}
                                            handleChange={(val) => setValue("priority", val)}
                                        />
                                        {errors.priority && (
                                            <p className="text-red-500">{errors.priority.message}</p>
                                        )}
                                    </div>
                                    <div className='col-span-6 flex flex-col'>
                                        <label htmlFor=''>Trạng thái hoạt đông</label>
                                        <SelectInput
                                            data={[
                                                { label: "Đang hoạt dộng", value: "ĐANG HOẠT ĐỘNG" },
                                                { label: "Đã khóa", value: "ĐÃ KHÓA" },
                                            ]}
                                            handleChange={(val) => setValue("status", val)}
                                        />
                                        {errors.status && (
                                            <p className="text-red-500">{errors.status.message}</p>
                                        )}
                                    </div>
                                    <div className='col-span-12 flex flex-col'>
                                        <label htmlFor=''>Mô tả</label>
                                        <Controller
                                            name="description"
                                            control={control}
                                            render={({ field }) => (
                                                <TextArea
                                                    rows={4}
                                                    {...field}   // đảm bảo có value, onChange, onBlur
                                                    placeholder="Nhập tên chính sách..."

                                                />
                                            )}
                                        />

                                        {errors.description && <p className="text-red-500">{errors.description.message}</p>}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className='item3 bg-white rounded p-3 '>
                    <div className='header flex justify-between items-center'>
                        <p className='text-lg font-semibold'>2. Danh sách Cấu phần phí (Components)</p>
                        <ButtonComponent
                            htmlType='button'
                            content='Thêm thành phần phí'
                            onClick={() => setOpen(true)}
                            type="primary"
                            icon={
                                <svg
                                    className='pointer-events-none'
                                    width={20}
                                    height={20}
                                >
                                    <use href='/icons.svg#hugeicons-plus-sign-circle' />
                                </svg>
                            }
                        />
                    </div>
                    <div className='content'>
                        {/* <FeeComponent
                            columns={columns}
                            dataSource={dataSource}
                        /> */}
                        <Table columns={columns} dataSource={dataSource} />
                        <ModalComponent
                            open={open}
                            onOk={handleOk}
                            onCancel={handleCancel}
                            confirmLoading={confirmLoading}
                            modalText={<FormAddFee />}
                        />
                    </div>
                </div>
                <div className='item4 bg-white rounded p-3 '>
                    <div className="flex justify-center items-center gap-3">

                        <ButtonComponent color='default' variant="outlined" content='Hủy' />
                        <ButtonComponent
                            form="policyForm"
                            htmlType="submit"
                            content="Thiết lập"
                        />
                        {/* <button  form="policyForm" type="submit" onClick={handleSubmit}>submit</button> */}

                    </div>

                </div>
            </div>

        </div>
    )
}

export default TestDemo
