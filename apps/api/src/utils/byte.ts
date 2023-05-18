export const btoa = (str: string) => {
  return Buffer.from(str).toString('base64')
}

export const atob = (b64Encoded: string) => {
  return Buffer.from(b64Encoded, 'base64')
}
