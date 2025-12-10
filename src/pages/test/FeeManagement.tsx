import { useNavigate } from 'react-router-dom'
import { FEEMANAGEMENR_V3 } from '@constants/routersConstant'
import { DeleteOutlined, EditOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { Input, SelectInput, ButtonComponent, Table } from '@components/common'
import { Card, message } from 'antd'
import React, { useState } from 'react'
import { useGetFeePoliciesQuery, useLazySearchFeePoliciesQuery, usePatchDeactivateFeeMutation, usePatchActivateFeeMutation } from '@services/apiFeePoliciesServices'
import { P } from '@antv/g2plot'
import { Controller, useForm } from 'react-hook-form'
import { FormInput, FormSelect } from '@components/form'

const FeeManagement = () => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [patchDeactivateFee, { isLoading: deactiveLoading }] = usePatchDeactivateFeeMutation();
    const [patchActivateFee, { isLoading: ActiveLoading }] = usePatchActivateFeeMutation();
    const { data, isLoading } = useGetFeePoliciesQuery({
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
    })
    const [searchFeePolicies, { data: searchData }] = useLazySearchFeePoliciesQuery();
    const navigate = useNavigate()
    const list = (searchData?.content ?? data?.content) || []
    const total = (searchData?.totalElements ?? data?.totalElements) || 0
    const dataSource = list.map((item, index) => ({
        key: item.id,
        no: (page - 1) * pageSize + index + 1,
        name: item.name,
        serviceType: item.serviceType,
        status: item.status,
        feeDomain: item.feeDomain,
        currency: item.currency,
        validFrom: item.validFrom,
        validTo: item.validTo
    }))

    const getSearchParams = () => ({
        keyword: '',
        serviceType: '',
        feeDomain: '',
        status: '',
        page,
        size: pageSize,
        sortBy: "createdAt",
        sortDirection: "DESC",
    });

    const handleDeActiveFee = async (record: any) => {
        try {
            await patchDeactivateFee(record.key).unwrap();
            message.success("Cập nhật trạng thái thành công");

            // Load lại dữ liệu
            searchFeePolicies(getSearchParams());
        } catch (error) {
            console.error(error);
            message.error("Cập nhật thất bại");
        }
    };

    const handleActiveFee = async (record: any) => {
        try {
            await patchActivateFee(record.key).unwrap();
            message.success("Cập nhật trạng thái thành công");

            // Load lại dữ liệu
            searchFeePolicies(getSearchParams());
        } catch (error) {
            console.error(error);
            message.error("Cập nhật thất bại");
        }
    };



    const columns = [
        { title: 'STT', dataIndex: 'no', width: 60, align: 'center' as const, className: 'border' },
        { title: 'Tên chính sách', dataIndex: 'name', className: 'border border-l-0' },
        { title: 'Loại dịch vụ', dataIndex: 'serviceType', className: 'border border-l-0' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            className: 'border border-l-0',
            align: 'center' as const,
            render: (status: string) => (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                >
                    {status}
                </span>
            )
        },
        { title: 'Phí miền', dataIndex: 'feeDomain', className: 'border border-l-0 border-b-0' },
        { title: 'Loại tiền', dataIndex: 'currency', className: 'border border-l-0 border-b-0' },
        {
            title: 'Hiệu lực từ',
            dataIndex: 'validFrom',
            className: 'border border-l-0 border-b-0',
            render: (date: string) =>
                date ? new Date(date).toLocaleDateString('vi-VN') : ''
        },
        {
            title: 'Hiệu lực đến',
            dataIndex: 'validTo',
            className: 'border border-l-0 border-b-0 ',
            render: (date: string) =>
                date ? new Date(date).toLocaleDateString('vi-VN') : ''
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            className: 'border border-l-0 border-b-0',
            align: 'center' as const,
            render: (record: any) => (
                <div className='flex gap-2 justify-center'>
                    <ButtonComponent
                        type='default'
                        icon={<EditOutlined />}
                        onClick={() => navigate(`${FEEMANAGEMENR_V3}/edit/${record.key}`)}
                    />
                    <ButtonComponent
                        type='default'

                        icon={record.status === "ACTIVE"
                            ? <UnlockOutlined />
                            : <LockOutlined />}



                        onClick={() => {
                            if (record.status === "ACTIVE") {
                                handleDeActiveFee(record);
                            } else {
                                handleActiveFee(record);
                            }
                        }}
                    />
                </div>
            )
        }
    ]





    const { register, handleSubmit, setValue, reset, control } = useForm({
        defaultValues: {
            keyword: "",
            serviceType: "",
            feeDomain: "",
            status: ""
        }
    })
    const handleSearch = (formValues: object) => {
        searchFeePolicies({
            ...formValues,
            page,
            size: pageSize,
            sortBy: "createdAt",
            sortDirection: "DESC",
        });
    }
    return (
        <>
            <Card>
                <form action="" onSubmit={handleSubmit(handleSearch)} id='feeManagement'>
                    <div className='grid grid-cols-12 gap-3'>
                        <FormInput
                            name="keyword"
                            control={control}
                            label="Tên chính sách"
                            placeholder="Nhập tên chính sách.."
                        />

                        <FormSelect
                            name="serviceType"
                            control={control}
                            label="Loại dịch vụ"
                            defaultValue=""
                            options={[
                                { label: 'Chọn tất cả', value: "" },
                                { label: 'EWALLET_WITHDRAWAL', value: "EWALLET_WITHDRAWAL" },
                                { label: 'EWALLET_TRANSFER_INTERNAL', value: "EWALLET_TRANSFER_INTERNAL" },
                                { label: 'EWALLET_TRANSFER_EXTERNAL', value: "EWALLET_TRANSFER_EXTERNAL" },
                                { label: 'EWALLET_CASHBACK', value: "EWALLET_CASHBACK" },
                                { label: 'MERCHANT_VA_BILL_COLLECTION', value: "MERCHANT_VA_BILL_COLLECTION" }
                            ]}
                        />
                        <FormSelect
                            name="status"
                            control={control}
                            label="Trạng thái"
                            defaultValue=""
                            options={[
                                { label: 'Chọn tất cả', value: "" },
                                { label: 'INIT', value: 'INIT' },
                                { label: 'ACTIVE', value: 'ACTIVE' },
                                { label: 'INACTIVE', value: 'INACTIVE' },
                                { label: 'LOCKED', value: 'LOCKED' },
                            ]}
                        />

                        <FormSelect
                            name="feeDomain"
                            control={control}
                            label="Phí miền"
                            defaultValue=""
                            options={[
                                { label: 'Chọn tất cả', value: "" },
                                { label: 'BANK', value: "BANK" },
                                { label: 'EWALLET', value: "EWALLET" },
                                { label: 'MERCHANT', value: "MERCHANT" }
                            ]}
                        />


                        <div className=' col-span-12 flex justify-between gap-3 '>
                            <div className="flex gap-2">
                                <ButtonComponent
                                    htmlType='submit'
                                    form='feeManagement'
                                    icon={
                                        <svg
                                            width={20}
                                            height={20}
                                        >
                                            <use href='/icons.svg#hugeicons-search-01' />
                                        </svg>
                                    }
                                    content='Search'
                                />
                                <ButtonComponent
                                    htmlType='button'
                                    content='Xoa bo loc'
                                    onClick={() => {
                                        reset();
                                        searchFeePolicies(getSearchParams());
                                    }}
                                    type='primary'
                                    icon={
                                        <svg
                                            className='pointer-events-none'
                                            width={20}
                                            height={20}
                                        >
                                            <use href='/icons.svg#hugeicons-delete-02' />
                                        </svg>
                                    }
                                />

                            </div>
                            <div className="">

                                <ButtonComponent
                                    htmlType='button'
                                    content='Thêm chính sách mới'
                                    onClick={() => navigate(FEEMANAGEMENR_V3 + '/create')}
                                    type='primary'
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
                        </div>
                        <div className='flex justify-end flex-col'>

                        </div>
                    </div>

                </form>

                <div className=''>
                    <Table
                        size='small'
                        dataSource={dataSource}
                        columns={columns}

                        pagination={{
                            current: page,
                            showSizeChanger: true,
                            pageSize: pageSize,
                            total: total,
                            onChange: (page, pageSize) => {
                                setPage(page)
                                setPageSize(pageSize)
                            }
                        }}
                    />
                </div>
            </Card>
        </>
    )
}

export default FeeManagement
