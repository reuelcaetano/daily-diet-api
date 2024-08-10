import { app } from './app'
import { env } from './env'
import { meals } from './routes/mealRoutes'
import { summary } from './routes/summaryRoutes'
import { users } from './routes/userRoutes'
import cookie from '@fastify/cookie'

app.register(cookie)

app.register(users, { prefix: '/users'})
app.register(meals, {prefix: '/meals'})
app.register(summary, {prefix: '/summary'})

app.listen({
  port: env.PORT,
  host: '0.0.0.0'
}).then(() => {
  console.log('HTTP running')
})