import fastify from 'fastify'
import { usersRoutes } from './routes/user'
import fastifyCookie from '@fastify/cookie'
import { mealScheduleRoutes } from './routes/meal-schedule'

export const app = fastify()

app.register(fastifyCookie)
app.register(mealScheduleRoutes, { prefix: '/meal-schedules' })
app.register(usersRoutes, { prefix: '/users' })
