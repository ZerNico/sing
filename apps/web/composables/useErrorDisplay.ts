import { TRPCClientError } from '@trpc/client'

export const useErrorDisplay = () => {
  const { notify } = useNotification()
  const { t } = useI18n()

  const displayError = (err: unknown) => {
    try {
      if (!err || !(err instanceof TRPCClientError)) {
        throw err
      }

      const message = err.message

      try {
        const zodErrors = JSON.parse(err.message) as unknown

        if (Array.isArray(zodErrors)) {
          for (const zodError of zodErrors) {
            notify({
              type: 'error',
              title: t('notification.error_title'),
              message: t(zodError.message),
            })
          }

          return
        }
      } catch (_err) {
        // ignore
      }

      notify({
        type: 'error',
        title: t('notification.error_title'),
        message: t(message),
      })
    } catch (err) {
      notify({
        type: 'error',
        title: t('notification.error_title'),
        message: t('error.unknown_error'),
      })
    }
  }

  return { displayError }
}
