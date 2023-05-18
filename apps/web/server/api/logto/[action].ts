import { logtoClient } from '~/lib/logto'

export default logtoClient.handleAuthRoutes({
  getAccessToken: true,
  resource: useRuntimeConfig().logto.resources.at(0),
})
