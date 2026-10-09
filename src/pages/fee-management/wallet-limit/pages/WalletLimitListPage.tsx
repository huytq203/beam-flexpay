import { useNavigate } from 'react-router-dom'
import { Can } from '@/app/permissions'
import { PlusIcon } from '@components/icons'
import { ButtonComponent, CardComponent, Table } from '@components/index'
import type { WalletLimitPolicy } from '@type/walletLimit.type'
import { createWalletLimitColumns } from '../columns/walletLimit.columns'
import { WalletLimitListFilters } from '../components/WalletLimitListFilters'
import { useWalletLimitList } from '../hooks/useWalletLimitList'
import { walletLimitPaths } from '../utils/walletLimit.paths'

const cardClass = 'border border-border bg-background shadow-none'

const WalletLimitListPage = () => {
  const navigate = useNavigate()
  const list = useWalletLimitList()
  const { query } = list

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className={cardClass}>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h1 className='text-base font-semibold text-foreground'>
              Hạn mức ví
            </h1>
            <p className='mt-1 text-xs text-muted-foreground'>
              Cấu hình hạn mức giao dịch theo ba lớp: Hệ thống, Nhóm, Ví. Lưu là
              có hiệu lực ngay, không qua bước duyệt.
            </p>
          </div>
          <Can
            screen='WALLET_LIMIT'
            action='create'
          >
            <ButtonComponent
              content='Thêm hạn mức'
              htmlType='button'
              icon={
                <PlusIcon
                  aria-hidden
                  size={18}
                />
              }
              onClick={() => navigate(walletLimitPaths.create)}
            />
          </Can>
        </div>
      </CardComponent>
      <CardComponent className={cardClass}>
        <WalletLimitListFilters
          draft={list.draft}
          onChange={list.setDraft}
          onApply={list.apply}
          onReset={list.reset}
        />
      </CardComponent>
      <CardComponent className={cardClass}>
        <p className='mb-3 border-b border-border pb-3 text-xs text-muted-foreground'>
          {query.data?.totalElements ?? 0} cấu hình · sắp theo ngày tạo mới nhất
        </p>
        {query.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 text-sm text-danger-strong'
          >
            Không thể tải danh sách hạn mức.
            <ButtonComponent
              type='default'
              size='small'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        )}
        <Table<WalletLimitPolicy>
          rowKey='id'
          size='small'
          scroll={{ x: 1900 }}
          loading={query.isFetching}
          onRefresh={query.refetch}
          dataSource={query.data?.content ?? []}
          locale={{ emptyText: 'Không có cấu hình nào khớp bộ lọc' }}
          pagination={{
            current: list.page,
            pageSize: list.size,
            total: query.data?.totalElements ?? 0,
            onChange: list.changePage
          }}
          columns={createWalletLimitColumns({
            page: list.page,
            size: list.size,
            onView: (id) => navigate(walletLimitPaths.detail(id)),
            onEdit: (id) => navigate(walletLimitPaths.edit(id))
          })}
        />
      </CardComponent>
    </main>
  )
}

export default WalletLimitListPage
