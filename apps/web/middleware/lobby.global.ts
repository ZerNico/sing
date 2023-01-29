export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/lobby') && !(await getLobby())) {
    return navigateTo('/join')
  } else if (to.path === '/join' && await getLobby()) {
    return navigateTo('/lobby')
  }
})

const getLobby = async () => {
  const { client } = useTRPC()
  const response = await client.lobby.joined.query()
  return response.lobby
}
