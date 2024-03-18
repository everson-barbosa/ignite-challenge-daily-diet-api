// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
    }
    meal: {
      id: string
      name: string
      description: string
      date_time: Date
      is_within_the_diet: boolean
      user_id: string
    }
  }
}
