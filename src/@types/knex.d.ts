/* eslint-disable @typescript-eslint/no-unused-vars */
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    meal_schedule: {
      id: string
      name: string
      description: string
      eaten_at: string
      is_on_plan: boolean
      user_id: string
    }
    users: {
      id: string
      name: string
      login: string
      password: string
    }
  }
}
