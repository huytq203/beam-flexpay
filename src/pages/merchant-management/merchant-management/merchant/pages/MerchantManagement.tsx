import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  Table,
  feedback
} from '@components/index'
import React, { useState } from 'react'
import FormSearch from '../components/FormSearch'
import useFetchData from '../hooks/useFetchData'
import { MerchantColumn } from '../column/column'
import { useNavigate } from 'react-router-dom'
import { Can } from '@/app/permissions'
import CardTotal from '../components/CardTotal'
import {
  useApproveMerchantMutation,
  useExportMerchantsMutation
} from '@services/apiMerchant'
import type { ContentMerchant } from '@type/merchant'

const MerchantManagement = () => {
  const {
    data,
    isFetching,
    refetch,
    totalElements,
    page,
    size,
    payload,
    setPage,
    setPageSize,
    setFilters
  } = useFetchData()
  const [exportMerchants, { isLoading: isExporting }] =
    useExportMerchantsMutation()
  const [approveMerchant, { isLoading: isApproving }] =
    useApproveMerchantMutation()
  const [merchantToApprove, setMerchantToApprove] =
    useState<ContentMerchant | null>(null)
  const navigate = useNavigate()

  const handleExport = async () => {
    try {
      const { blob, filename } = await exportMerchants(payload).unwrap()
      if (!filename) throw new Error('API không trả tên file xuất')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      feedback.error('Không thể xuất danh sách merchant')
    }
  }

  const handleApprove = async () => {
    if (!merchantToApprove) return
    try {
      await approveMerchant(merchantToApprove.id).unwrap()
      feedback.success('Đã phê duyệt hồ sơ ĐVCNTT')
      setMerchantToApprove(null)
    } catch {
      feedback.error(
        'Không thể phê duyệt ĐVCNTT. Vui lòng tải lại danh sách và kiểm tra trạng thái hồ sơ.'
      )
    }
  }

  return (
    <div className='space-y-3!'>
      <CardTotal />
      <CardComponent>
        <FormSearch onSearch={setFilters} />
      </CardComponent>
      <CardComponent>
        <div className='flex justify-between items-center gap-3 mb-3'>
          <div className=''>
            <span className='font-medium text-base'>Danh sách merchant</span>
          </div>
          <div className='flex gap-3'>
            <Can
              screen='MERCHANT_MANAGEMENT'
              action='export'
            >
              <ButtonComponent
                content='Xuất CSV'
                type='default'
                loading={isExporting}
                onClick={() => void handleExport()}
              />
            </Can>
            <Can
              screen='MERCHANT_MANAGEMENT'
              action='create'
            >
              <ButtonComponent
                onClick={() => navigate('create')}
                content='Tạo mới'
                type='primary'
              />
            </Can>
          </div>
        </div>

        <Table
          key='id'
          size='small'
          columns={MerchantColumn({
            onEdit: (id) => navigate(`create/${id}`),
            onView: (id) => navigate(`detail/${id}`),
            onApprove: setMerchantToApprove
          })}
          dataSource={data}
          loading={isFetching}
          onRefresh={refetch}
          pagination={{
            current: page,
            pageSize: size,
            total: totalElements,
            onChange: (nextPage, nextSize) => {
              setPage(nextPage)
              setPageSize(nextSize)
            }
          }}
        />
      </CardComponent>
      <DialogModal
        open={merchantToApprove !== null}
        title='Phê duyệt hồ sơ ĐVCNTT'
        okText='Phê duyệt'
        confirmLoading={isApproving}
        okButtonProps={{ disabled: isApproving }}
        cancelButtonProps={{ disabled: isApproving }}
        closable={!isApproving}
        maskClosable={!isApproving}
        onCancel={() => setMerchantToApprove(null)}
        onOk={() => void handleApprove()}
      >
        <p className='text-sm text-foreground'>
          Xác nhận phê duyệt <strong>{merchantToApprove?.name}</strong> (
          {merchantToApprove?.code})? Hồ sơ sẽ được kích hoạt sau khi backend
          kiểm tra đầy đủ thông tin và trạng thái ví.
        </p>
      </DialogModal>
    </div>
  )
}

export default MerchantManagement
