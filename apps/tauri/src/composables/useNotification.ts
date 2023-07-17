import { Optional } from '~/lib/utils/type'

export interface Notification {
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

export interface NotificationWithId extends Notification {
  id: number
}

export const notifications = ref<NotificationWithId[]>([])
const id = ref(0)

export const useNotification = () => {
  const notify = ({ type = 'info', ...rest }: Optional<Notification, 'type'>) => {
    const notification = { ...rest, type, id: id.value++ }
    notifications.value.push(notification)
    return notification
  }

  const dismiss = (notification: NotificationWithId) => {
    const index = notifications.value.findIndex((n) => n.id === notification.id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  return {
    notifications,
    notify,
    dismiss: dismiss,
  }
}
