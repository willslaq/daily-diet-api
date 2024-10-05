import { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '../env'
import jwt from 'jsonwebtoken'

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: Function,
) {
  console.log(request.cookies)
  try {
    const token = request.cookies.token

    if (!token) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const decoded = jwt.verify(token, env.JWT_SECRET)
    request.user = decoded

    done()
  } catch (err) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}
