import type { UploadFile } from 'antd'

export const isImageFile = (file: UploadFile) =>
  (file.type ?? file.originFileObj?.type ?? '').startsWith('image/') ||
  /\.(png|jpe?g)$/i.test(file.name)
