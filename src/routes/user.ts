import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'
import { env } from '../env'
import bcrypt from 'bcrypt'
import { authMiddleware } from '../middlewares/auth-middleware'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const userSchema = z.object({
      name: z.string(),
      login: z.string().min(1),
      password: z.string().min(5),
    })

    const { name, login, password } = userSchema.parse(request.body)

    const userExists = await knex('users').where({ login }).first()

    if (userExists) {
      return reply.status(400).send({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await knex('users')
      .insert({
        id: randomUUID(),
        name,
        login,
        password: hashedPassword,
      })
      .returning('*')

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

  app.post('/auth', async (request, reply) => {
    const loginSchema = z.object({
      login: z.string().min(1),
      password: z.string().min(5),
    })

    const { login, password } = loginSchema.parse(request.body)

    const user = await knex('users').where({ login }).first()

    if (!user) {
      return reply.status(400).send({ message: 'User not found' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return reply.status(400).send({ message: 'Invalid password' })
    }

    const token = jwt.sign({ login, name: user.name }, env.JWT_SECRET, {
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
      .send({ message: 'User authenticated' })
  })

  app.get(
    '/me',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }
      const { login } = request.user

      const user = await knex('users').where({ login }).first()

      if (!user) {
        return reply.status(400).send({ message: 'User not found' })
      }

      reply.send({ name: user.name, login })
    },
  )

  app.post('/logout', async (request, reply) => {
    reply.clearCookie('token').send({ message: 'User logged out' })
  })
}
