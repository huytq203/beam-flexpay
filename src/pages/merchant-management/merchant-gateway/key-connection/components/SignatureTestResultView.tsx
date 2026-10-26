import type { SignatureTestResult } from '@/app/services/merchantGatewayApi'
import { TagComponent } from '@components/index'
import { SIGNATURE_TEST_RESULT } from '../constants/credential.constants'

export function SignatureTestResultView({
  result
}: {
  result: SignatureTestResult
}) {
  return (
    <div
      role='status'
      className='flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted p-3 text-sm'
    >
      <span className='font-medium'>Kết quả:</span>
      <TagComponent color={result.verified ? 'success' : 'error'}>
        {SIGNATURE_TEST_RESULT[result.result] ?? result.result}
      </TagComponent>
      <span className='text-xs text-muted-foreground'>{result.authMode}</span>
    </div>
  )
}
