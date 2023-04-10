import type { ClientRouterOutput } from '~/composables/useTRPC'

export type User = ClientRouterOutput['lobby']['status']['lobby']['users'][number]
