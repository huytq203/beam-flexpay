import { useState } from 'react'
import { SettlementItemDetailDrawer } from '../components/SettlementItemDetailDrawer'
import { SettlementItemsPanel } from '../components/SettlementItemsPanel'

export default function SettlementItemListPage() {
  const [detailId, setDetailId] = useState<string | null>(null)

  return (
    <>
      <SettlementItemsPanel onView={(item) => setDetailId(item.id)} />
      {detailId && (
        <SettlementItemDetailDrawer
          key={detailId}
          itemId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </>
  )
}
