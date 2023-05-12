import type { Router } from 'vue-router'

import { initialized } from './logic/ui/init'

export const loadGuards = (router: Router) => {
  router.beforeEach((to, _from, next) => {
    const songsStore = useSongsStore()
    if (initialized.value && songsStore.needsUpdate && to.path !== '/loading') {
      next({ path: '/loading', query: { redirect: to.fullPath }, replace: true })
    } else {
      next()
    }
  })

  router.beforeEach((_to, _from, next) => {
    if (!initialized.value) {
      initialized.value = true
      next({
        path: '/',
      })
    } else {
      next()
    }
  })
}
