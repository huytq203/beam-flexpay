import { useEffect, useState } from 'react'
import { FRAME_NAMES, frameUrl, type FrameName } from '../frames/manifest'

export type CapyImages = ReadonlyMap<FrameName, HTMLImageElement>

function loadImage(
  name: FrameName
): Promise<readonly [FrameName, HTMLImageElement]> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve([name, image])
    image.onerror = () => reject(new Error(`Không tải được khung hình ${name}`))
    image.src = frameUrl(name)
  })
}

/** Tải ảnh khung hình một lần, chỉ khi `enabled` đúng; đã tải thì giữ lại. Lỗi tải thì không hiện Capy, không báo lỗi lên UI. */
export function useCapyFrames(enabled: boolean): CapyImages | null {
  const [images, setImages] = useState<CapyImages | null>(null)

  useEffect(() => {
    if (!enabled || images) return
    let cancelled = false
    Promise.all(FRAME_NAMES.map(loadImage))
      .then((entries) => {
        if (!cancelled) setImages(new Map(entries))
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [enabled, images])

  return images
}
