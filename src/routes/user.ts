import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'
import { env } from '../env'

const userSchema = z.object({
  name: z.string(),
  login: z.string().min(1),
  password: z.string().min(5),
})

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const { name, login, password } = userSchema.parse(request.body)

    const userExists = await knex('users').where({ login }).first()

    if (userExists) {
      return reply.status(400).send({ message: 'User already exists' })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      login,
      password,
    })

    const token = jwt.sign({ login, name }, env.JWT_SECRET, {
      expiresIn: '1h',
    })

    reply
      .setCookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
      .send({ message: 'User created' })
  })
}
