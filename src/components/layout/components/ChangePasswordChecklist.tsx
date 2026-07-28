import {
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon
} from '@phosphor-icons/react'
import { CHANGE_PASSWORD_RULES } from '@/app/schemas/change-password'

interface ChangePasswordChecklistProps {
  password: string
}

export function ChangePasswordChecklist({
  password
}: ChangePasswordChecklistProps) {
  const passedCount = CHANGE_PASSWORD_RULES.filter((rule) =>
    rule.test(password)
  ).length

  return (
    <section
      className="rounded-xl bg-muted p-3"
      aria-label="Điều kiện mật khẩu mới"
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-primary-foreground">
        <span>Điều kiện mật khẩu</span>
        <span className="tabular-nums text-muted-foreground">
          {passedCount}/{CHANGE_PASSWORD_RULES.length}
        </span>
      </div>

      <ul className="grid gap-1.5 min-[360px]:grid-cols-2">
        {CHANGE_PASSWORD_RULES.map((rule) => {
          const hasPassed = rule.test(password)
          return (
            <li
              key={rule.id}
              className={`flex min-w-0 items-start gap-2 text-xs ${
                hasPassed ? 'text-green-700' : 'text-muted-foreground'
              }`}
            >
              {hasPassed ? (
                <CheckCircleIcon
                  aria-hidden
                  className="mt-0.5 shrink-0"
                  size={15}
                  weight="fill"
                />
              ) : (
                <CircleIcon
                  aria-hidden
                  className="mt-0.5 shrink-0"
                  size={15}
                />
              )}
              <span>
                {rule.label}
                <span className="sr-only">
                  {hasPassed ? ', đã đạt' : ', chưa đạt'}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
