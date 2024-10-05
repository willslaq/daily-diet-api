import { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '../env'
import jwt, { JwtPayload } from 'jsonwebtoken'

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const token = request.cookies.token

    if (!token) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload

    if (typeof decoded === 'string') {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    request.user = decoded as {
      login: string
      name: string
      iat: number
      exp: number
    }
  } catch (err) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}
