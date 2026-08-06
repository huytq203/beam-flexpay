export const getParamsFromURL = (key: string) => {
  return new URLSearchParams(window.location.search).get(key)
}
