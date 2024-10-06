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

  app.get('/', { preHandler: [authMiddleware] }, async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { login } = request.user
    const user = await knex('users').where({ login }).first()
    if (!user) {
      return reply.status(404).send({ message: 'User not found' })
    }

    const mealSchedule = await knex('meal_schedule').where({
      user_id: user.id,
    })

    reply.status(200).send({ mealSchedule })
  })

  app.get('/:id', { preHandler: [authMiddleware] }, async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    if (!request.user) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const mealSchedule = await knex('meal_schedule')
      .where({
        id,
      })
      .first()

    reply.status(200).send({ mealSchedule })
  })

  app.put('/:id', { preHandler: [authMiddleware] }, async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const mealScheduleSchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      eatenAt: z.string().optional(),
      isOnPlan: z.boolean().optional(),
    })

    const { id } = paramsSchema.parse(request.params)

    if (!request.user) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { login } = request.user
    const user = await knex('users').where({ login }).first()
    if (!user) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { name, description, eatenAt, isOnPlan } = mealScheduleSchema.parse(
      request.body,
    )
    const mealSchedule = await knex('meal_schedule').where({ id }).first()

    if (!name && !description && !eatenAt && !isOnPlan) {
      return reply.status(400).send({ message: 'No fields were provided' })
    }
    if (!mealSchedule) {
      return reply.status(404).send({ message: 'Meal schedule not found' })
    }
    if (mealSchedule.user_id !== user.id) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    await knex('meal_schedule')
      .update({
        name,
        description,
        eaten_at: eatenAt,
        is_on_plan: isOnPlan,
      })
      .where({ id })

    reply.status(200).send()
  })

  app.get(
    '/stats',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const { login } = request.user

      const user = await knex('users').where({ login }).first()
      if (!user) {
        return reply.status(404).send({ message: 'User not found' })
      }

      const totalMealsResult = await knex('meal_schedule')
        .where({
          user_id: user.id,
        })
        .count('id', { as: 'totalMeals' })
        .first()
      const totalMeals = totalMealsResult?.totalMeals

      const totalMealsOnPlanResult = await knex('meal_schedule')
        .where({
          user_id: user.id,
          is_on_plan: true,
        })
        .count('id', { as: 'totalMealsOnPlan' })
        .first()
      const totalMealsOnPlan = totalMealsOnPlanResult?.totalMealsOnPlan

      const totalMealsNotOnPlan = Number(totalMeals) - Number(totalMealsOnPlan)

      const meals = await knex('meal_schedule')
        .where({
          user_id: user.id,
        })
        .orderBy('eaten_at', 'asc')

      let bestStreak = []
      let currentStreak = []

      for (let i = 0; i < meals.length; i++) {
        if (meals[i].is_on_plan) {
          currentStreak.push(meals[i])
        } else {
          if (currentStreak.length > bestStreak.length) {
            bestStreak = [...currentStreak]
          }
          currentStreak = []
        }
      }

      if (currentStreak.length > bestStreak.length) {
        bestStreak = [...currentStreak]
      }

      const totalBestStreak = bestStreak.length
      const totalCurrentStreak = currentStreak.length

      reply.status(200).send({
        totalMeals,
        totalMealsOnPlan,
        totalMealsNotOnPlan,
        totalBestStreak,
        totalCurrentStreak,
      })
    },
  )

  app.delete(
    '/:id',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = paramsSchema.parse(request.params)

      if (!request.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const { login } = request.user
      const user = await knex('users').where({ login }).first()
      if (!user) {
        return reply.status(404).send({ message: 'User not found' })
      }

      const mealSchedule = await knex('meal_schedule').where({ id }).first()

      if (!mealSchedule) {
        return reply.status(404).send({ message: 'Meal schedule not found' })
      }

      if (user.id !== mealSchedule.user_id) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      await knex('meal_schedule').where({ id }).del()

      reply.status(200).send()
    },
  )
}
