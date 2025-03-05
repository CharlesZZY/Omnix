import type { Env } from '~/types/env'
import process from 'node:process'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { createServiceConfig } from '~/utils/service'
import * as schema from './schema'

const { database } = createServiceConfig(process.env as unknown as Env.ImportMeta)

const pool = mysql.createPool({
  ...database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export const tables = schema

let drizzleInstance: ReturnType<typeof drizzle> | null = null

export function useDrizzle() {
  if (!drizzleInstance) {
    drizzleInstance = drizzle(pool, { schema, mode: 'default', logger: true })
  }
  return drizzleInstance
}
