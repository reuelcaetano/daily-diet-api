import { FastifyInstance } from "fastify"
import { knex } from "../database"
import { z } from "zod"
import { randomUUID } from "node:crypto"

export async function users(app: FastifyInstance) {
  app.get('/', async () => {
    const users = await knex('users').select()
    return { users }
  })
  
  app.post('/', async (req, res) => {
    const createUserBodySchema = z.object({
      name: z.string()
    })
    let { session_id } = req.cookies
    
    if (session_id) {
      await knex('meals').where({session_id}).update({
        user_id: session_id
      })
    }

    if (!session_id) {
      session_id = randomUUID()
    
      res.setCookie('session_id', session_id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }
      
    const { name } = createUserBodySchema.parse(req.body)
    await knex('users').insert({
      id: session_id,
      name,
    })
    return res.status(201).send()
  })
}