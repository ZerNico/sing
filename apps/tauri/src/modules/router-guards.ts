import { UserModule } from '~/types'

const initialized = ref(false)

export const install: UserModule = ({ router }) => {
  router.beforeEach((to, _from, next) => {
    const songsStore = useSongsStore()
    if (initialized.value && songsStore.needsUpdate && to.path !== '/loading') {
      next({ path: '/loading', query: { redirect: to.fullPath }, replace: true })
    } else {
      next()
    }
  })

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
