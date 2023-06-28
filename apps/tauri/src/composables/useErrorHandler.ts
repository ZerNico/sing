import { TRPCClientError } from '@trpc/client'

import { isTRPCClientError } from './useTRPC'

export const useErrorHandler = () => {
  const { notify } = useNotification()
  const { t } = useI18n()

  const errorNotify = (message: string) => {
    notify({
      title: t('notification.error_title'),
      message,
      type: 'error',
    })
  }

  const handleError = (e: unknown) => {
    if (
      e instanceof TRPCClientError &&
      e.data?.code === 'UNAUTHORIZED' &&
      e.data?.message === 'error.access_token_invalid'
    ) {
      window.location.reload()
      return
    }

    if (isTRPCClientError(e)) {
      const fieldErrors = e.data?.zodError?.fieldErrors
      if (fieldErrors) {
        for (const value of Object.values(fieldErrors)) {
          const message = value?.at(0)
          if (message) {
            errorNotify(t(message))
          }
        }
      } else {
        if (e.message === 'Load failed') {
          errorNotify(t('error.could_not_connect'))
          return
        }

        errorNotify(t(e.message))
      }
      return
    }
    errorNotify(t('error.unknown_error'))
  }

  return {
    handleError,
  }
}
