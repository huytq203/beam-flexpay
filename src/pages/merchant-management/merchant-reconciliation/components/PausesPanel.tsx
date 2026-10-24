import { useState } from 'react'
import { useGetReconciliationPausesQuery } from '@/app/services/merchantReconciliationApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent, Table } from '@components/index'
import { createPauseColumns } from '../columns/pause.columns'
import { PAGE_SIZE } from '../constants/reconciliation.constants'
import type { SettlementPause } from '../types/reconciliation.types'
import { ConfirmHandledDialog } from './ConfirmHandledDialog'

/** Danh sách Sub đang bị tạm dừng quyết toán (BE không phân trang, cũ nhất trước). */
export function PausesPanel() {
  const pauses = useGetReconciliationPausesQuery()
  const [page, setPage] = useState(1)
  const [target, setTarget] = useState<SettlementPause>()

  if (pauses.isError)
    return (
      <div role='alert'>
        <p>
          {getApiErrorDetail(
            pauses.error,
            'Không tải được danh sách tạm dừng quyết toán.'
          )}
        </p>
        <ButtonComponent
          content='Thử lại'
          htmlType='button'
          onClick={() => void pauses.refetch()}
        />
      </div>
    )

  return (
    <>
      <Table
        columns={createPauseColumns({
          page,
          pageSize: PAGE_SIZE,
          onConfirm: setTarget
        })}
        dataSource={pauses.data ?? []}
        loading={pauses.isFetching}
        locale={{ emptyText: 'Không có Sub-merchant nào đang bị tạm dừng' }}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: pauses.data?.length ?? 0,
          showSizeChanger: false,
          hideOnSinglePage: true,
          onChange: setPage
        }}
        rowKey='id'
        scroll={{ x: 'max-content' }}
        size='small'
      />
      {target && (
        <ConfirmHandledDialog
          key={target.id}
          pause={target}
          onClose={() => setTarget(undefined)}
        />
      )}
    </>
  )
}
