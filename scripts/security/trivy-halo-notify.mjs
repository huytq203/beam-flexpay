// Tóm tắt báo cáo JSON của Trivy và gửi tin nhắn lên Halo qua Bot API.
// Usage: node scripts/security/trivy-halo-notify.mjs <trivy-report.json>
//
// Env:
//   HALO_BOT_TOKEN          <botId>:<secret> (GitLab CI variable, masked)
//   HALO_CONVERSATION_UUID  conversation nhận thông báo
//   HALO_API_BASE           mặc định https://bot.halotech.io.vn/api/v1
//   TRIVY_FAIL_SEVERITY     vd "CRITICAL,HIGH" → exit 1 nếu có lỗi mức đó
//   HALO_DRY_RUN=1          chỉ in tin nhắn, không gửi
import { existsSync, readFileSync } from 'node:fs'

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']
const ICONS = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🔵' }
const MAX_TEXT = 4096
const MAX_DETAIL_ITEMS = 15
const env = process.env

const parseList = (value) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)

const collectFindings = (report) => {
  const vulns = new Map()
  const secrets = []
  const misconfigs = []

  for (const result of report.Results ?? []) {
    for (const v of result.Vulnerabilities ?? []) {
      const key = `${v.VulnerabilityID}|${v.PkgName}|${v.InstalledVersion}`
      vulns.set(key, {
        severity: v.Severity,
        label: `${v.VulnerabilityID} ${v.PkgName}@${v.InstalledVersion}`,
        hint: v.FixedVersion ? `fix: ${v.FixedVersion}` : 'chưa có bản vá'
      })
    }
    // Không đưa nội dung secret (Match/Code) vào tin nhắn, chỉ vị trí + rule.
    for (const s of result.Secrets ?? []) {
      secrets.push({
        severity: s.Severity,
        label: `${result.Target}:${s.StartLine}`,
        hint: s.Title ?? s.RuleID
      })
    }
    for (const m of result.Misconfigurations ?? []) {
      if (m.Status && m.Status !== 'FAIL') continue
      misconfigs.push({
        severity: m.Severity,
        label: `${result.Target} ${m.AVDID ?? m.ID}`,
        hint: m.Title
      })
    }
  }

  return { vulns: [...vulns.values()], secrets, misconfigs }
}

const countBySeverity = (items) =>
  SEVERITIES.map((severity) => [
    severity,
    items.filter((item) => item.severity === severity).length
  ]).filter(([, count]) => count > 0)

const formatCounts = (items) => {
  if (items.length === 0) return '0'
  const parts = countBySeverity(items).map(([sev, count]) => `${sev} ${count}`)
  return `${items.length} (${parts.join(' · ')})`
}

const formatDetails = (groups) => {
  const important = groups.flatMap(([name, items]) =>
    items
      .filter((item) => ['CRITICAL', 'HIGH'].includes(item.severity))
      .map((item) => ({ ...item, name }))
  )
  important.sort(
    (a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity)
  )

  const lines = important
    .slice(0, MAX_DETAIL_ITEMS)
    .map(
      (item) =>
        `${ICONS[item.severity]} [${item.name}] ${item.label} — ${item.hint}`
    )
  const rest = important.length - MAX_DETAIL_ITEMS
  if (rest > 0) lines.push(`… và ${rest} lỗi CRITICAL/HIGH khác`)
  return lines
}

const buildHeader = (title) => [
  title,
  `Project: ${env.CI_PROJECT_PATH ?? 'local'}`,
  `Branch: ${env.CI_COMMIT_REF_NAME ?? '-'} @ ${env.CI_COMMIT_SHORT_SHA ?? '-'}`,
  `Trigger: ${env.GITLAB_USER_LOGIN ?? '-'}`
]

const buildFooter = () =>
  [env.CI_JOB_URL && `Job: ${env.CI_JOB_URL}`].filter(Boolean)

const buildReportMessage = (findings, isFailing) => {
  const { vulns, secrets, misconfigs } = findings
  const total = vulns.length + secrets.length + misconfigs.length
  const title = isFailing
    ? '🚨 Trivy: phát hiện lỗ hổng vượt ngưỡng'
    : total > 0
      ? '⚠️ Trivy: có cảnh báo bảo mật'
      : '✅ Trivy: không phát hiện lỗ hổng'
  const details = formatDetails([
    ['vuln', vulns],
    ['secret', secrets],
    ['config', misconfigs]
  ])

  return [
    ...buildHeader(title),
    '',
    `Thư viện: ${formatCounts(vulns)}`,
    `Secret: ${formatCounts(secrets)}`,
    `Cấu hình: ${formatCounts(misconfigs)}`,
    ...(details.length > 0 ? ['', 'CRITICAL/HIGH:', ...details] : []),
    '',
    ...buildFooter()
  ].join('\n')
}

const truncate = (text) =>
  text.length <= MAX_TEXT ? text : `${text.slice(0, MAX_TEXT - 2)}\n…`

const sendToHalo = async (text) => {
  const token = env.HALO_BOT_TOKEN?.trim()
  const conversationUuid = env.HALO_CONVERSATION_UUID?.trim()
  if (!token || !conversationUuid) {
    console.warn(
      '[halo] Thiếu HALO_BOT_TOKEN/HALO_CONVERSATION_UUID, bỏ qua gửi.'
    )
    return
  }

  const base = (env.HALO_API_BASE ?? 'https://bot.halotech.io.vn/api/v1')
    .trim()
    .replace(/\/+$/, '')
  // Key ổn định theo job để retry không gửi trùng tin nhắn.
  const idempotencyKey = `trivy-${env.CI_PIPELINE_ID ?? 'local'}-${env.CI_JOB_ID ?? Date.now()}`

  try {
    const res = await fetch(`${base}/bot/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({ conversationUuid, text }),
      signal: AbortSignal.timeout(15_000)
    })
    if (res.ok) {
      console.log('[halo] Đã gửi thông báo.')
      return
    }
    const body = await res.json().catch(() => null)
    const code = body?.error?.code ?? 'UNKNOWN'
    console.warn(`[halo] Gửi thất bại: HTTP ${res.status} ${code}`)
  } catch (error) {
    console.warn(`[halo] Gửi thất bại: ${error.name}: ${error.message}`)
  }
}

const main = async () => {
  const reportPath = process.argv[2]
  if (!reportPath) {
    console.error('Usage: node trivy-halo-notify.mjs <trivy-report.json>')
    return 2
  }

  if (!existsSync(reportPath)) {
    const text = [
      ...buildHeader('❌ Trivy: job quét bảo mật bị lỗi, không có báo cáo'),
      '',
      ...buildFooter()
    ].join('\n')
    if (env.HALO_DRY_RUN === '1') console.log(text)
    else await sendToHalo(text)
    return 1
  }

  const findings = collectFindings(JSON.parse(readFileSync(reportPath, 'utf8')))
  const failSeverities = parseList(env.TRIVY_FAIL_SEVERITY)
  const isFailing = [
    ...findings.vulns,
    ...findings.secrets,
    ...findings.misconfigs
  ].some((item) => failSeverities.includes(item.severity))
  const text = truncate(buildReportMessage(findings, isFailing))

  if (env.HALO_DRY_RUN === '1') console.log(text)
  else await sendToHalo(text)

  if (isFailing) {
    console.error(`[trivy] Có lỗi mức ${failSeverities.join('/')}.`)
    return 1
  }
  return 0
}

process.exitCode = await main()
