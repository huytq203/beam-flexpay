import { useSubMerchantTerminalCounts } from '../hooks/useSubMerchantTerminalCounts'

export function SubMerchantTerminalCount({ id }: { id: string }) {
  const { total } = useSubMerchantTerminalCounts(id)
  return <span className='tabular-nums'>{total}</span>
}
