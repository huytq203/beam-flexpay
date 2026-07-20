/**
 * Narrows an unknown thrown value (RTK Query rejection, Error, ...) down to the
 * `data.detail` message returned by the API, when it is present and a string.
 */
export const getApiErrorDetail = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;
  if (!('data' in error)) return undefined;
  const data = error.data;
  if (typeof data !== 'object' || data === null) return undefined;
  if (!('detail' in data)) return undefined;
  return typeof data.detail === 'string' ? data.detail : undefined;
};
