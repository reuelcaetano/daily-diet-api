import { FastifyInstance } from "fastify"
import { checkSessionIdExists } from "../middlewares/check_session_id_exists"
import { knex } from "../database"

export async function summary(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists]}, async(req, res) => {
    const { session_id } = req.cookies

    const meals_registred = await knex('meals').where(
      {session_id}
    ).count('id as total').first()

    const meals_diet = await knex('meals').where(
      {session_id, diet: true}
    ).count('id as total').first()

    const meals_no_diet = await knex('meals').where(
      {session_id, diet: false}
    ).count('id as total').first()

    const totalMeals = await knex('meals')
        .where({ session_id })
        .orderBy('registred_at', 'desc')

    const { bestSequence } = totalMeals.reduce(
      (acc, meal) => {
        if (meal.diet) {
          acc.currentSequence += 1
        } else {
          acc.currentSequence = 0
        }

        if (acc.currentSequence > acc.bestSequence) {
          acc.bestSequence = acc.currentSequence
        }

        return acc
      },
      { bestSequence: 0, currentSequence: 0 },
    )

    const summary = {
      meals_registred: meals_registred?.total,
      meals_diet: meals_diet?.total,
      meals_no_diet: meals_no_diet?.total,
      best_sequence: bestSequence
    }

    return res.send(summary)
  })
}