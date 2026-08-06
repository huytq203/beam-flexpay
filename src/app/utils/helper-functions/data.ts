import { isEqual, reduce } from 'lodash'

export function toPromise<T>(value: T): Promise<T> {
  return Promise.resolve(value)
}

export const fnTransformResponse = <T>(response: { data: T }): T => {
  return response.data
}

export function parseManually(value: string) {
  const trimmedValue = value.trim().slice(1, -1)
  const result: Record<string, string | number> = {}
  const pairs = trimmedValue.match(
    /("(?:\\"|[^"])*?"|\d+):("(?:\\"|[^"])*?"|\d+)/g
  )

  if (!pairs) return value

  pairs.forEach((pair) => {
    const [key, entryValue] = pair
      .split(/:(.+)/)
      .map((entry) => entry.trim())
    const cleanedKey = key.replace(/^"(.*)"$/, '$1')
    const rawValue = entryValue.replace(/^"(.*)"$/, '$1')

    result[cleanedKey] = Number.isNaN(Number(rawValue))
      ? rawValue
      : Number(rawValue)
  })

  return result
}

export const compareData = (
  notification: Record<string, unknown>,
  payload: Record<string, unknown>
) => {
  return reduce(
    payload,
    (result: string[], value, key) => {
      if (!isEqual(value, notification[key])) result.push(key)
      return result
    },
    [] as string[]
  )
}
