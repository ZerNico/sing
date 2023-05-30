import { TRPCClientError } from '@trpc/client'

export const isUnauthorizedError = (error: unknown) => {
  return (
    error instanceof TRPCClientError &&
    error.data.code === 'UNAUTHORIZED' &&
    error.data.message === 'error.invalid_token'
  )
}
