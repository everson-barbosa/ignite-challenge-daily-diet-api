import fastify from 'fastify'
import { usersRoutes } from './routes/users.routes'
import { mealsRoutes } from './routes/meals.routes'

export const app = fastify()

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(mealsRoutes, {
  prefix: 'meals',
})
