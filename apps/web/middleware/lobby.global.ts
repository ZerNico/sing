import { TRPCClientError } from '@trpc/client'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!(to.path.startsWith('/lobby') || to.path.startsWith('/join'))) {
    return
  }

  const { client } = useTRPC()
  const { logIn } = useAuth()

  try {
    const response = await client.lobby.joined.query()

    if (to.path.startsWith('/lobby') && !response.lobby) {
      return navigateTo('/join')
    } else if (to.path === '/join' && response.lobby) {
      return navigateTo('/lobby')
    }
  } catch (e) {
    if (e instanceof TRPCClientError) {
      if (e?.data?.code === 'UNAUTHORIZED') {
        await logIn({ callbackUrl: to.path })
        return navigateTo(to.path)
      } else {
        return navigateTo('/')
      }
    }
  }
})
