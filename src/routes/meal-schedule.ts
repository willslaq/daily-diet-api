import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { authMiddleware } from '../middlewares/auth-middleware'

export async function mealScheduleRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [authMiddleware] }, async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { login } = request.user

    const user = await knex('users').where({ login }).first()

    const mealScheduleSchema = z.object({
      name: z.string(),
      description: z.string(),
      eatenAt: z.string(),
      isOnPlan: z.boolean(),
    })

    const { name, description, eatenAt, isOnPlan } = mealScheduleSchema.parse(
      request.body,
    )

    await knex('meal_schedule').insert({
      id: randomUUID(),
      name,
      description,
      eaten_at: eatenAt,
      is_on_plan: isOnPlan,
      user_id: user.id,
    })

    reply.status(201).send()
  })
}
