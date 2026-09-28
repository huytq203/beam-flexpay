import dayjs from 'dayjs'

export const formatDateTime = (value?: string | null) =>
  value ? dayjs.utc(value).format('DD/MM/YYYY HH:mm:ss') : '—'

export const formatCode = (value?: string | null) =>
  value ? value.replaceAll('_', ' ') : '—'

export const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY') : '—'

export const shortIssuePlace = (value?: string | null) =>
  value?.replace(
    /CỤC TRƯỞNG CỤC CẢNH SÁT\s*QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI/gi,
    'Cục CS QLHC về TTXH'
  )
