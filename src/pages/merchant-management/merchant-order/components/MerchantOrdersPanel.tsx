import { Can } from '@/app/permissions'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { PlusOutlined } from '@components/icons'
import {
  ButtonComponent,
  ExportCsvButton,
  PopoverComponent,
  Table
} from '@components/index'
import { useAccessMerchants } from '../../merchant-access/hooks/useAccessMerchants'
import { AccessPageShell } from '../../merchant-access/components/AccessPageShell'
import { createMerchantOrderColumns } from '../columns/merchantOrder.columns'
import { ORDER_PAGE_SIZE_OPTIONS } from '../constants/merchantOrder.constants'
import { useMerchantOrderListData } from '../hooks/useMerchantOrderListData'
import type {
  MerchantOrder,
  OrderActionKind
} from '../types/merchantOrder.types'
import { MerchantOrderFilters } from './MerchantOrderFilters'
import { OrderStatusFlow } from './OrderStatusFlow'

interface Props {
  onView: (order: MerchantOrder) => void
  onAction: (kind: OrderActionKind, order: MerchantOrder) => void
  onCreate: () => void
}

export function MerchantOrdersPanel({ onView, onAction, onCreate }: Props) {
  const { getMerchant } = useAccessMerchants()
  const data = useMerchantOrderListData()
  const { ordersQuery } = data
  const columns = createMerchantOrderColumns({
    page: data.page,
    pageSize: data.pageSize,
    onView,
    onAction
  })

  return (
    <AccessPageShell
      title='Danh sách đơn hàng'
      count={ordersQuery.data?.totalElements}
      actions={
        <>
          <PopoverComponent
            content={<OrderStatusFlow />}
            title='Quy trình trạng thái đơn'
            trigger='click'
            placement='bottomRight'
          >
            <ButtonComponent
              htmlType='button'
              type='default'
              content='Quy trình trạng thái'
            />
          </PopoverComponent>
          <Can
            screen='MERCHANT_ORDER'
            action='export'
          >
            <ExportCsvButton
              onExport={data.exportCsv}
              loading={data.isExporting}
              disabled={!data.total}
            />
          </Can>
          <Can
            screen='MERCHANT_ORDER'
            action='create'
          >
            <ButtonComponent
              content='Tạo đơn hàng'
              htmlType='button'
              icon={<PlusOutlined aria-hidden />}
              onClick={onCreate}
            />
          </Can>
        </>
      }
      toolbar={
        <MerchantOrderFilters
          draft={data.draft}
          getMerchant={getMerchant}
          onChange={data.setDraft}
          onApply={data.apply}
          onReset={data.reset}
        />
      }
    >
      {ordersQuery.isError && (
        <div
          role='alert'
          className='mb-3 flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
        >
          {getApiErrorDetail(
            ordersQuery.error,
            'Không thể tải danh sách đơn hàng.'
          )}
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={() => void ordersQuery.refetch()}
          />
        </div>
      )}
      <Table<MerchantOrder>
        columns={columns}
        dataSource={[...data.orders]}
        loading={ordersQuery.isFetching}
        locale={{ emptyText: 'Không có đơn hàng nào' }}
        onRefresh={ordersQuery.refetch}
        pagination={{
          current: data.page,
          pageSize: data.pageSize,
          total: data.total,
          showSizeChanger: true,
          pageSizeOptions: ORDER_PAGE_SIZE_OPTIONS,
          onChange: (page, size) => data.setPagination(page, size)
        }}
        rowKey='id'
        scroll={{ x: 'max-content' }}
        size='small'
      />
      <p className='mt-2 text-xs text-muted-foreground'>
        * Phí ước tính, chỉ là số cuối cùng khi đơn Thành công. Danh sách chỉ
        gồm đơn thuộc phạm vi được gán cho bạn.
      </p>
    </AccessPageShell>
  )
}
