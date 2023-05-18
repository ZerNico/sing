export interface Notification {
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

export interface NotificationWithId extends Notification {
  id: number
}

export type AnyFn = (...args: any[]) => any

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
