import { CheckCircleOutlined, InfoCircleOutlined } from '@components/icons'

interface InheritedPaymentSummaryProps {
  methods: readonly string[]
  limit: string
}

export function InheritedPaymentSummary({
  methods,
  limit
}: InheritedPaymentSummaryProps) {
  return (
    <section
      aria-labelledby='inherited-payment-title'
      className='space-y-3 rounded-lg border border-border bg-muted/30 p-4'
    >
      <div className='flex items-start gap-2'>
        <InfoCircleOutlined
          aria-hidden
          className='mt-0.5 text-secondary-foreground'
        />
        <div>
          <h2
            id='inherited-payment-title'
            className='font-display text-sm font-semibold text-foreground'
          >
            Cấu hình thanh toán kế thừa
          </h2>
          <p className='mt-1 text-xs leading-5 text-muted-foreground'>
            Terminal sử dụng cấu hình từ Sub-merchant cha và không thể ghi đè
            tại đây.
          </p>
        </div>
      </div>
      <div className='grid gap-3 md:grid-cols-2'>
        <div>
          <p className='text-xs font-medium text-muted-foreground'>
            Hình thức thanh toán
          </p>
          <ul className='mt-2 flex flex-wrap gap-2'>
            {methods.map((method) => (
              <li
                key={method}
                className='inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground'
              >
                <CheckCircleOutlined
                  aria-hidden
                  className='text-success-strong'
                />
                {method}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className='text-xs font-medium text-muted-foreground'>
            Hạn mức áp dụng
          </p>
          <p className='mt-2 text-sm font-semibold text-foreground tabular-nums'>
            {limit}
          </p>
        </div>
      </div>
    </section>
  )
}
