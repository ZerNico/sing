import { App } from 'vue'
import { Router } from 'vue-router'

export type UserModule = (ctx: { router: Router; app: App }) => void
