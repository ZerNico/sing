import { AppType } from 'api'
import { ErrorDto, HonoClientError } from 'api/error'
import { hc } from 'hono/client'
import { joinURL } from 'ufo'

export const useHono = () => {
  const client = hc<AppType>(joinURL(import.meta.env.VITE_API_URL, 'api', 'v1'), {
    fetch: async (input, init) => {
      try {
        const response = await fetch(input, init)

        if (!response.ok) {
          const body = (await response.json()) as ErrorDto

          throw new HonoClientError({
            message: body.error,
            status: response.status,
            validationErrors: body.validationErrors,
            cause: body.cause,
          })
        }

        return response
      } catch (error) {
        if (error instanceof HonoClientError) throw error
        throw new HonoClientError({ message: 'could_not_connect' })
      }
    },
  })

  return { client }
}

export const isHonoClientError = (error: unknown): error is HonoClientError => {
  return error instanceof HonoClientError
}
