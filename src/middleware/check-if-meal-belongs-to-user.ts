import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export const checkIfMealBelongsToUser = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const deleteMealSchemaParams = z.object({
    id: z.string(),
  })

  const notBelongsFeedbackMessage = `You cannot ${request.method}} this meal`

  const { 'user-id': userId } = request.headers

  const { id } = deleteMealSchemaParams.parse(request.params)

  const meal = await knex('meals')
    .select()
    .where({
      id,
    })
    .first()

  if (!meal) {
    reply.status(404).send({ message: 'There is no meal with that id' })
  }

  if (meal.user_id !== userId) {
    reply.status(404).send({ message: notBelongsFeedbackMessage })
  }
}
