import type { Router } from 'vue-router'

import { initialized } from './logic/ui/init'
export const loadGuards = (router: Router) => {
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
