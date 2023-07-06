import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { authApp } from './routes/auth.ts'

const app = new Hono().get('/', (c) => c.text('Hello Hono!')).route('/auth', authApp)

serve(app, (info) => {
  console.log(`Server is running on port ${info.port}`)
})
