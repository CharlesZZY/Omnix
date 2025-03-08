import type { Env } from '~/types/env'
import process from 'node:process'
import { defineConfig } from 'drizzle-kit'
import { createServiceConfig } from '~/utils/service'

const { database } = createServiceConfig(process.env as unknown as Env.ImportMeta)

export default defineConfig({
  dialect: 'mysql',
  dbCredentials: {
    host: database.host,
    port: Number(database.port),
    user: database.user,
    password: database.password,
    database: database.database,
  },
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
})
