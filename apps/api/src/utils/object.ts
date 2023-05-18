export const hasAnyKey = (obj: Record<string, unknown>): boolean => {
  return Object.keys(obj).some((key) => obj[key] !== undefined)
}
