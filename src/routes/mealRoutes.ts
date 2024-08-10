import { z } from "zod";
import { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check_session_id_exists";

export async function meals(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (req) => {
    const { session_id } = req.cookies
    const meals = await knex('meals').where('session_id', session_id).select()
    return { meals }
  })

  app.get('/:id', { preHandler: [checkSessionIdExists]}, async (req, res) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid()
    })
    const { session_id } = req.cookies

    const { id } = getMealParamsSchema.parse(req.params)
    const meal = await knex('meals').where({session_id, id}).first()
    if (!meal) { res.status(404).send() }

    return { meal }
  })

  app.post('/', async (req, res) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      diet: z.boolean(),
      registred_at: z.string(),
    })

    const { name, description, diet, registred_at} = createMealBodySchema.parse(req.body)
    
    let session_id = req.cookies.session_id
    let user_id = session_id
    if (!session_id) {
      session_id = randomUUID()
      user_id = null
      res.setCookie('session_id', session_id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }

    await knex('meals').insert({
      id: randomUUID(),
      user_id,
      name,
      description,
      diet,
      registred_at,
      session_id
    })

    return res.status(201).send()
  })

  app.put('/', { preHandler: [checkSessionIdExists] }, async (req) => {
    const updateMealBodySchema = z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string(),
      diet: z.boolean(),
      registred_at: z.string(),
    })

    const { session_id } = req.cookies

    const { id, name, description, diet, registred_at } = updateMealBodySchema.parse(req.body)
    await knex('meals').update({
      id,
      name,
      description,
      diet,
      registred_at
    }).where({id, session_id})
  })

  app.delete('/:id', { preHandler: [checkSessionIdExists] }, async (req) => {
    const { session_id } = req.cookies

    const deleteMealParamsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = deleteMealParamsSchema.parse(req.params)
    await knex('meals').delete().where(
      {
        id,
        session_id
      }
    )
  })
}