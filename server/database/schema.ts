import { sql } from 'drizzle-orm'
import { bigint, mysqlTable, serial, text, timestamp, varchar } from 'drizzle-orm/mysql-core'

export const USER = mysqlTable('user', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
  ),
})

export const CONVERSATION = mysqlTable('conversation', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
  userId: bigint('user_id', { mode: 'number', unsigned: true })
    .notNull()
    .references(() => USER.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull().default('新对话'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export const USER_MESSAGE = mysqlTable('user_message', {
  id: varchar('id', { length: 36 }).primaryKey().notNull(),
  conversationId: varchar('conversation_id', { length: 36 })
    .notNull()
    .references(() => CONVERSATION.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export const AI_MESSAGE = mysqlTable('ai_message', {
  id: varchar('id', { length: 36 }).primaryKey().notNull(),
  conversationId: varchar('conversation_id', { length: 36 })
    .notNull()
    .references(() => CONVERSATION.id, { onDelete: 'cascade' }),
  userMessageId: varchar('user_message_id', { length: 36 })
    .notNull()
    .references(() => USER_MESSAGE.id, { onDelete: 'cascade' }),
  model: varchar('model', { length: 50 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})
