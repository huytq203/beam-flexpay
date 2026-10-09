import { useState } from 'react'
import type { WalletLimitSpecialMonth } from '@type/walletLimit.type'
import { CardComponent } from '@components/index'
import { SpecialMonthDeleteDialog } from '../components/SpecialMonthDeleteDialog'
import { SpecialMonthForm } from '../components/SpecialMonthForm'
import { SpecialMonthList } from '../components/SpecialMonthList'
import { SpecialMonthRenameModal } from '../components/SpecialMonthRenameModal'

const WalletLimitSpecialMonthPage = () => {
  const [renaming, setRenaming] = useState<WalletLimitSpecialMonth | null>(null)
  const [deleting, setDeleting] = useState<WalletLimitSpecialMonth | null>(null)

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <h1 className='text-xl font-semibold'>Tháng đặc biệt</h1>
        <p className='mt-1 max-w-prose text-xs text-muted-foreground'>
          Tháng có trong danh mục dùng hạn mức tháng (đặc biệt) cho mọi cấu
          hình. Lớp nào để trống trần này thì dùng hạn mức tháng (thường) của
          chính lớp đó.
        </p>
      </CardComponent>
      <SpecialMonthForm />
      <SpecialMonthList
        onRename={setRenaming}
        onDelete={setDeleting}
      />
      {renaming && (
        <SpecialMonthRenameModal
          month={renaming}
          onClose={() => setRenaming(null)}
        />
      )}
      {deleting && (
        <SpecialMonthDeleteDialog
          month={deleting}
          onClose={() => setDeleting(null)}
        />
      )}
    </main>
  )
}

export default WalletLimitSpecialMonthPage
