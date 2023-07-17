import { isHonoClientError } from './useHono'

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

  const handleError = (error: unknown) => {
    if (isHonoClientError(error)) {
      if (error.validationErrors) {
        for (const messages of Object.values(error.validationErrors)) {
          for (const message of messages) {
            errorNotify(t(`validation.${message}`))
          }
        }
      } else {
        errorNotify(t(`error.${error.message}`))
      }
    } else {
      errorNotify(t('error.unknown_error'))
    }
  }

  return { handleError }
}
