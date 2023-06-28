import { UserModule } from '~/types'

const initialized = ref(false)

export const install: UserModule = ({ router }) => {
  router.beforeEach((_to, _from, next) => {
    if (initialized.value) {
      next()
    } else {
      initialized.value = true
      next({
        path: '/',
      })
    }
  })
}
