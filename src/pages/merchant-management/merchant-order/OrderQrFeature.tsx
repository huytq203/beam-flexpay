import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined, BankFilled } from '@components/icons'
import { ReloadOutlined } from '@ant-design/icons'
import { ButtonComponent, CardComponent } from '@components/index'
import { useGetMerchantOrderByIdQuery, usePostRefreshQrMutation } from '@services/apiOrderMerchant.api'
import { MerchanOrderItem } from './types/apiOrder.type'
import { QRCode } from 'antd'
import { MERCHANT } from '@constants/routersConstant'

const OrderQrFeature = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [qrValue, setQrValue] = useState(localStorage.getItem('QR') || '')

  const { data: orderData, refetch } = useGetMerchantOrderByIdQuery(id || '', {
    skip: !id,
  })
  console.log(id)
  const [postRefreshQr, { isLoading: isRefreshing }] = usePostRefreshQrMutation()

  const order: MerchanOrderItem | undefined = orderData?.data
  console.log(orderData)
  const handleRefreshQR = async () => {
    if (!id) return

    try {
      const result = await postRefreshQr(id).unwrap()
      if (result?.data?.qrCode) {
        localStorage.setItem("QR", result.data.qrCode)
        setQrValue(result.data.qrCode)
      }
      // Refetch order data để cập nhật thông tin
      refetch()
    } catch (error) {
      // Handle error silently
    }
  }

  const handleBackToOrders = () => {
    navigate(`${MERCHANT}/merchant-order`)
  }

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      'ACTIVE': { label: 'ACTIVE', className: 'bg-yellow-100 text-yellow-700' },
      'SUCCESS': { label: 'PAID', className: 'bg-green-100 text-green-700' },
      'EXPIRED': { label: 'EXPIRED', className: 'bg-red-100 text-red-700' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['ACTIVE']
    return <span className={`px-3 py-1 rounded text-xs font-medium ${config.className}`}>{config.label}</span>
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={handleBackToOrders}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftOutlined /> Back to Orders
      </button>

      <CardComponent
        content={
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Payment QR Code</h1>
            <p className="text-gray-600 mb-6">
              Order: <span className="text-blue-600 font-medium">{order?.orderCode}</span>
            </p>

            <div className="flex justify-center items-center">
              <QRCode
                value={qrValue || order?.qrCode || ''}
                size={256}
                bordered
                errorLevel="M"
              />

            </div>
            {order?.qrCode && (
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                </div>
              </div>
            )}

            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-lg">{order?.amount?.toLocaleString()} VND</span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600 flex items-center gap-2">
                  <span className="text-blue-600"><BankFilled /></span> Bank
                </span>
                <span className="font-medium text-blue-600">{order?.bankCode || 'Vietcombank'}</span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Payment Ref</span>
                <span className="font-mono text-sm">{order?.paymentRef}</span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Payment Name</span>
                <span className="text-sm">{order?.paymentName}</span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Status</span>
                {getStatusBadge(order?.status)}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 flex items-center justify-center gap-2">
                <ReloadOutlined className="animate-spin" />
                Waiting for payment. You can refresh QR code if needed.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <ButtonComponent
                onClick={handleRefreshQR}
                className="flex-1"
                loading={isRefreshing}
                content={
                  <div className="flex items-center justify-center gap-2">
                    <ReloadOutlined /> Refresh QR Code
                  </div>
                }
              />
              <ButtonComponent
                onClick={handleBackToOrders}
                type="primary"
                className="flex-1"
                content="Back to Orders"
              />
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Scan this QR code with your banking app to complete payment
              <br />
              Click "Refresh QR Code" if you need to regenerate the QR
            </p>
          </div>
        }
      />
    </div>
  )
}

export default OrderQrFeature