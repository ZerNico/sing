import { isUnauthorizedError } from '~/lib/utils/api'
import { navigateToWithoutFlash } from '~/lib/utils/navigation'

export default defineNuxtRouteMiddleware(async (to) => {
  const { client } = useTRPC()
  const { getSigInUrl } = useLogto()

  // TODO: use parameter in future version
  const localePath = useLocalePath()

  try {
    const { lobby } = await client.lobby.current.query()

    if (to.meta.lobby && !lobby) {
      return navigateTo(localePath('/join'))
    } else if (to.meta.lobby === false && lobby) {
      return navigateTo(localePath('/lobby'))
    }
  } catch (err) {
    if (isUnauthorizedError(err)) {
      return navigateToWithoutFlash(getSigInUrl(to.path), { external: true })
    }

    return navigateTo('/500')
  }
})
