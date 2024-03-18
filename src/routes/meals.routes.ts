import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkIfMealBelongsToUser } from '../middleware/check-if-meal-belongs-to-user'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const { 'user-id': userId } = request.headers

    const meals = await knex('meals').select().where({ user_id: userId })

    return { meals }
  })

  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      dateTime: z.string().transform((value) => new Date(value)),
      isWithinTheDiet: z.boolean(),
    })
    const createMealHeadersSchema = z.object({
      'user-id': z.string().uuid(),
    })

    const { 'user-id': userId } = createMealHeadersSchema.parse(request.headers)

    const { name, description, dateTime, isWithinTheDiet } =
      createMealBodySchema.parse(request.body)

    const user = await knex('users').select().where({ id: userId }).first()

    if (!user) {
      reply.status(404).send({ message: 'There is no user with that ID' })
    }

    const meal = {
      id: randomUUID(),
      name,
      description,
      date_time: dateTime,
      is_within_the_diet: isWithinTheDiet,
      user_id: userId,
    }

    await knex('meals').insert(meal)

    return { meal }
  })

  app.put(
    '/:id',
    { preHandler: checkIfMealBelongsToUser },
    async (request, reply) => {
      const updateMealSchemaParams = z.object({
        id: z.string(),
      })

      const updateMealSchemaBody = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        dateTime: z
          .string()
          .transform((value) => new Date(value))
          .optional(),
        isWithinTheDiet: z.boolean().optional(),
      })

      const createMealHeadersSchema = z.object({
        'user-id': z.string().uuid(),
      })

      const { 'user-id': userId } = createMealHeadersSchema.parse(
        request.headers,
      )

      const { id } = updateMealSchemaParams.parse(request.params)

      const { name, description, dateTime, isWithinTheDiet } =
        updateMealSchemaBody.parse(request.body)

      await knex('meals')
        .update({
          ...(name && { name }),
          ...(description && { description }),
          ...(dateTime && { date_time: dateTime }),
          ...(isWithinTheDiet && { is_within_the_diet: isWithinTheDiet }),
        })
        .where({
          user_id: userId,
          id,
        })
        .then(() => {
          reply.status(204).send({ message: 'Updated meal successfull' })
        })
        .catch(() => {
          reply.status(500).send({ message: 'Error on try to delete meal' })
        })
    },
  )

  app.delete(
    '/:id',
    { preHandler: checkIfMealBelongsToUser },
    async (request, reply) => {
      const deleteMealSchemaParams = z.object({
        id: z.string(),
      })

      const createMealHeadersSchema = z.object({
        'user-id': z.string().uuid(),
      })

      const { 'user-id': userId } = createMealHeadersSchema.parse(
        request.headers,
      )

      const { id } = deleteMealSchemaParams.parse(request.params)

      await knex('meals')
        .delete()
        .where({
          id,
          user_id: userId,
        })
        .then(() => {
          reply.status(204).send({ message: 'Deleted meal successfull' })
        })
        .catch(() => {
          reply.status(500).send({ message: 'Error on try to delete meal' })
        })
    },
  )
}
