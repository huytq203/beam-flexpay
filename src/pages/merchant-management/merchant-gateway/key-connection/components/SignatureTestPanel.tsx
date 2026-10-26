import { useState } from 'react'
import {
  useDryRunGatewayCredentialSignatureMutation,
  useVerifyGatewayCredentialSignatureMutation,
  type ApiCredential,
  type MerchantApiAuthMode,
  type SignatureTestResult
} from '@/app/services/merchantGatewayApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import {
  ButtonComponent,
  SegmentedComponent,
  SelectComponent,
  TextArea
} from '@components/index'
import { AUTH_MODE_OPTIONS } from '../constants/credential.constants'
import { CredentialFormError } from './CredentialFormError'
import { SignatureTestResultView } from './SignatureTestResultView'

type TestMode = 'stored' | 'dryRun'

const TEST_MODES = [
  { label: 'Khóa đang lưu', value: 'stored' as const },
  { label: 'Chạy thử public key mới (RSA)', value: 'dryRun' as const }
]

// Không lưu gì và không ghi log nội dung: chuỗi ký, chữ ký và public key chỉ
// đi thẳng tới API kiểm tra.
export function SignatureTestPanel({
  credential
}: {
  credential: ApiCredential
}) {
  const [mode, setMode] = useState<TestMode>('stored')
  const [authMode, setAuthMode] = useState<MerchantApiAuthMode>(
    credential.authMode ?? 'HMAC_SHA256'
  )
  const [canonicalRequest, setCanonicalRequest] = useState('')
  const [signature, setSignature] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [result, setResult] = useState<SignatureTestResult | null>(null)
  const [error, setError] = useState('')
  const [verify, verifyState] = useVerifyGatewayCredentialSignatureMutation()
  const [dryRun, dryRunState] = useDryRunGatewayCredentialSignatureMutation()
  const isDryRun = mode === 'dryRun'

  const run = async () => {
    setResult(null)
    const canonical = canonicalRequest.trim()
    const signed = signature.trim()
    const pem = publicKey.trim()
    if (!canonical || !signed || (isDryRun && !pem)) {
      setError(
        isDryRun
          ? 'Vui lòng nhập public key, chuỗi ký và chữ ký'
          : 'Vui lòng nhập chuỗi ký và chữ ký'
      )
      return
    }
    setError('')
    const body = { canonicalRequest: canonical, signature: signed }
    try {
      setResult(
        isDryRun
          ? await dryRun({
              id: credential.id,
              authMode: 'RSA_SHA256',
              merchantPublicKey: pem,
              ...body
            }).unwrap()
          : await verify({ id: credential.id, authMode, ...body }).unwrap()
      )
    } catch (failure) {
      setError(getApiErrorDetail(failure, 'Không thể kiểm tra chữ ký'))
    }
  }

  return (
    <div className='space-y-3'>
      <SegmentedComponent<TestMode>
        ariaLabel='Loại kiểm tra chữ ký'
        options={TEST_MODES}
        value={mode}
        onChange={(value) => {
          setMode(value)
          setResult(null)
          setError('')
        }}
      />
      {isDryRun ? (
        <div>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='signature-public-key'
          >
            Public key RSA mới (PEM)
          </label>
          <TextArea
            id='signature-public-key'
            value={publicKey}
            onChange={(event) => setPublicKey(event.target.value)}
            rows={4}
            maxLength={16384}
            spellCheck={false}
            className='font-mono text-xs!'
          />
        </div>
      ) : (
        <div className='flex max-w-sm flex-col gap-1'>
          <label
            className='text-sm font-medium'
            htmlFor='signature-auth-mode'
          >
            Cơ chế xác thực
          </label>
          <SelectComponent
            id='signature-auth-mode'
            aria-label='Cơ chế xác thực chữ ký'
            value={authMode}
            options={AUTH_MODE_OPTIONS}
            onChange={(value: MerchantApiAuthMode) => setAuthMode(value)}
          />
        </div>
      )}
      <div>
        <label
          className='mb-1 block text-sm font-medium'
          htmlFor='signature-canonical'
        >
          Chuỗi ký (canonical request)
        </label>
        <TextArea
          id='signature-canonical'
          value={canonicalRequest}
          onChange={(event) => setCanonicalRequest(event.target.value)}
          rows={3}
          maxLength={8192}
          spellCheck={false}
          className='font-mono text-xs!'
          placeholder='accessKey=...&method=POST&path=/api/v1/integration/merchant/...&requestId=...&timestamp=...'
        />
      </div>
      <div>
        <label
          className='mb-1 block text-sm font-medium'
          htmlFor='signature-value'
        >
          Chữ ký
        </label>
        <TextArea
          id='signature-value'
          value={signature}
          onChange={(event) => setSignature(event.target.value)}
          rows={2}
          maxLength={4096}
          spellCheck={false}
          className='font-mono text-xs!'
        />
      </div>
      <CredentialFormError message={error} />
      <ButtonComponent
        content={isDryRun ? 'Chạy thử chữ ký' : 'Kiểm tra chữ ký'}
        loading={verifyState.isLoading || dryRunState.isLoading}
        onClick={() => void run()}
      />
      {result && <SignatureTestResultView result={result} />}
      <p className='text-xs text-muted-foreground'>
        Kết quả hợp lệ chỉ xác nhận chữ ký. Request thật vẫn phải qua kiểm tra
        IP Whitelist, timestamp và chống phát lại (replay).
      </p>
    </div>
  )
}
