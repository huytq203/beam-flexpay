import { useOrder } from "./hooks";
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import ModalDetailOrder from "./components/ModalDetailOrder";
import FormAddOrder, { FormAddOrderRef } from "./components/FormAddOrder";
import { OrderFormValues } from "./schemas/Order.schema";
import { CardComponent, ModalComponent, Table } from "@components/index";
import { MERCHANT } from '@constants/routersConstant'

const OrderFeature = () => {
  const navigate = useNavigate();
  const {
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
    selectOrder,

    handleConFirm,
    handleCreateOrder

  } = useOrder();

  const formAddOrderRef = useRef<FormAddOrderRef>(null);

  const handleCreateSubmit = async (data: OrderFormValues) => {
    const orderId = await handleCreateOrder(data);
    if (orderId) {
      navigate(`${MERCHANT}/merchant-order/qr/${orderId}`)

    }
  };

  const handleCreateOk = () => {
    formAddOrderRef.current?.submit();
  };

  return (
    <div>
      <CardComponent
        content={
          <>
            <div className="flex justify-between items-end mb-3">
              <span className="font-bold text-xl">Order</span>
              {/* <ButtonComponent
                onClick={() => openModal('create')}
                content={
                  <>
                    <PlusCircleOutlined /> Thêm mới
                  </>
                }
              /> */}
            </div>
            <Table
              rowKey={"id"}
              bordered
              size="small"
              columns={columns}
              dataSource={dataSource}
              pagination={{
                current: page,
                showSizeChanger: true,
                pageSize: size,
                total: getMerchantOrder?.data?.totalElements,
                onChange: (page, pageSize) => {
                  setPage(page);
                  setPageSize(pageSize);
                },
              }}
            />
          </>
        }
      />
      <ModalComponent title='Chi tiết Order' width="70%" modalText={<ModalDetailOrder selectOrder={selectOrder} handleConFirm={handleConFirm} />} onCancel={() => closeModal('detail')} open={modeOpen.detail} onOk={() => { }} />
      <ModalComponent title='Thêm mới Order' width="35%" modalText={<FormAddOrder ref={formAddOrderRef} onSubmit={handleCreateSubmit} merchantOptions={merchantOption} />} open={modeOpen.create} onCancel={() => closeModal('create')} onOk={handleCreateOk} />
    </div>
  );
};

export default OrderFeature;
