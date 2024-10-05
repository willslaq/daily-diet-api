import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user?: { login: string; name: string; iat: number; exp: number }
  }
}
