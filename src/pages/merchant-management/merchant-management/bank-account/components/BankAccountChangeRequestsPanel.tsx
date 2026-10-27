import { useState } from 'react'
import { useTypedSelector } from '@/app/store'
import { getApiErrorDetail } from '@/app/utils/api-error'
import type { BankAccountChangeRequestItem } from '@/app/services/merchantBankAccountApi'
import {
  ButtonComponent,
  CardComponent,
  SelectComponent,
  Table
} from '@components/index'
import { createBankAccountChangeRequestColumns } from '../columns/bankAccountChangeRequest.columns'
import { CHANGE_REQUEST_STATUS_OPTIONS } from '../constants/bankAccountChangeRequest.constants'
import { useBankAccountChangeRequests } from '../hooks/useBankAccountChangeRequests'
import type { BankAccountDecisionType } from './BankAccountDecisionDialog'
import { BankAccountRequestDecision } from './BankAccountRequestDecision'

interface Decision {
  type: BankAccountDecisionType
  request: BankAccountChangeRequestItem
}

/** Tab "Yêu cầu chờ duyệt": hàng đợi đổi/đặt mặc định tài khoản của mọi Merchant trong phạm vi. */
export function BankAccountChangeRequestsPanel() {
  const list = useBankAccountChangeRequests()
  const { query } = list
  const currentUserId = useTypedSelector((state) => state.auth.profile.jwtId)
  const [decision, setDecision] = useState<Decision | null>(null)

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <div className='mb-3 max-w-xs'>
          <label
            htmlFor='bank-account-request-status'
            className='mb-1 block text-sm font-medium text-foreground'
          >
            Trạng thái yêu cầu
          </label>
          <SelectComponent
            id='bank-account-request-status'
            className='w-full'
            options={CHANGE_REQUEST_STATUS_OPTIONS}
            value={list.status}
            onChange={list.setStatus}
          />
        </div>
        {query.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 text-sm text-danger-strong'
          >
            {getApiErrorDetail(query.error, 'Không thể tải danh sách yêu cầu.')}
            <ButtonComponent
              size='small'
              type='default'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        )}
        <Table<BankAccountChangeRequestItem>
          rowKey='id'
          size='small'
          onRefresh={query.refetch}
          loading={query.isFetching}
          dataSource={query.data?.content ?? []}
          locale={{ emptyText: 'Không có yêu cầu nào' }}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: list.page,
            pageSize: list.size,
            total: query.data?.totalElements ?? 0,
            onChange: list.changePage
          }}
          columns={createBankAccountChangeRequestColumns({
            page: list.page,
            size: list.size,
            currentUserId,
            onDecide: (type, request) => setDecision({ type, request })
          })}
        />
      </CardComponent>
      {decision && (
        <BankAccountRequestDecision
          key={`${decision.type}:${decision.request.id}`}
          type={decision.type}
          request={decision.request}
          onClose={() => setDecision(null)}
        />
      )}
    </main>
  )
}
