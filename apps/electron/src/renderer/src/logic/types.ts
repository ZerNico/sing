import type { ClientRouterOutput } from '@renderer/composables/useTRPC'

export type User = ClientRouterOutput['lobby']['status']['lobby']['users'][number]
