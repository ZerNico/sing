import { navigateToWithoutFlash } from '~/lib/utils/navigation'

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, getSigInUrl } = useLogto()

  if (!isAuthenticated.value) {
    return navigateToWithoutFlash(getSigInUrl(to.path), { external: true })
  }
})
