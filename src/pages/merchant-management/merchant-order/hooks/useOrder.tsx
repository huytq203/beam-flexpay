import { OrderColumn } from '../columns/Order.column'
import {
  useGetMerchantOrderQuery,
  usePostMerchantOrderConfirmMutation,
  usePostMerchantOrderMutation,
  usePostRefreshQrMutation,
} from '@services/apiOrderMerchant.api'
import { MerchanOrderItem } from '../types/apiOrder.type'
import usePagination from '@hooks/usePagination'
import { useState } from 'react'
import { ModalKey, ModeAction } from '../constants/Order.constant'
import { useGetMerchantQuery } from '@services/apiMerchant'
import { ContentMerchant } from '@type/merchant'
import { OrderFormValues } from '../schemas/Order.schema'
import dayjs from 'dayjs'
import Swal from "sweetalert2";
export const useOrder = () => {
  // states
  const [selectOrder, setSelectOrder] = useState<MerchanOrderItem | null>(null)
  const [modeOpen, setModalOpen] = useState({
    detail: false,
    create: false
  })
  const [modeAction, SetModeAction] = useState<ModeAction>()
  // hooks
  const { page, size, setPage, setPageSize } = usePagination();
  const { data: getMerchantOrder } = useGetMerchantOrderQuery({ page, size });
  const [postConFirm, { isLoading: isloadingConFirm }] = usePostMerchantOrderConfirmMutation()
  const [postMerChantOrder, { isLoading: isloadingPost }] = usePostMerchantOrderMutation()
  const [postReFreshQr, { isLoading: isloadingPostReFreshQr }] = usePostRefreshQrMutation()
  const { data: dataMerchant } = useGetMerchantQuery({});

  //   logic

  const merchantOption = dataMerchant?.content?.map((item: ContentMerchant) => ({
    label: item.name,
    value: item.id,
  })) ?? []


  const handleRefreshQR = async (orderId: string) => {
    const result = await postReFreshQr(orderId).unwrap()
    // Update localStorage với QR code mới
    if (result?.data?.qrCode) {
      localStorage.setItem("QR", result.data.qrCode)
    }
    return result
  }

  const handleCreateOrder = async (data: OrderFormValues) => {
    const payload = {
      merchantId: data.merchantId,
      orderCode: data.orderCode,
      amount: data.amount,
      orderDescription: data.description,
      purpose: data.purpose,
      bankCode: data.bankCode,
      currency: 'VND',
      netAmount: data.amount,
      expiredAt: dayjs().add(1, 'hour').toISOString(),
    }

    const result = await postMerChantOrder(payload).unwrap()
    closeModal('create')
    localStorage.setItem("QR", result.data.qrCode)
    // Return order ID để navigate
    return result?.data?.id
  }

  const handleConFirm = async (amount: number) => {
    if (!selectOrder?.id) return;
    await postConFirm({ id: selectOrder.id, body: { amount } }).unwrap()
    closeModal('detail')
    setSelectOrder(null)
    // notification.success({ message: 'Xác thực thành công!', placement: 'top' })
    Swal.fire({
      title: 'Xác thực thành công!',
      icon: 'success',
      showConfirmButton: false, // Ẩn nút OK
      timer: 1500,              // Tự đóng sau 1.5s
      timerProgressBar: true,   // (tuỳ chọn) thanh đếm
    })
  }


  const handleOpenModalDetail = (selectOrder: MerchanOrderItem) => {
    openModal('detail')
    setSelectOrder(selectOrder)
  }

  const openModal = (key: ModalKey) => {
    setModalOpen((prev) => ({
      ...prev,
      [key]: true,
    }));
  };

  const closeModal = (key: ModalKey) => {
    setModalOpen((prev) => ({
      ...prev,
      [key]: false,
    }));
  };
  const dataSource = getMerchantOrder?.data?.content.map((item: MerchanOrderItem, index: number) => ({
    ...item,
    no: (page - 1) * size + index + 1
  }))

  const columns = OrderColumn({ handleOpenModalDetail });
  return {
    columns,
    dataSource,
    merchantOption,
    page,
    size,
    getMerchantOrder,
    setPage,
    setPageSize,
    openModal,
    closeModal,
    modeOpen,
    modeAction,
    selectOrder,

    handleConFirm,
    handleCreateOrder,
    handleRefreshQR
  };
};
