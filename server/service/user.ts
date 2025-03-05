import { eq } from 'drizzle-orm'
import { useDrizzle } from '../database'
import { USER } from '../database/schema'

const db = useDrizzle()

type InsertUser = typeof USER.$inferInsert

export async function createUser(user: InsertUser) {
  return await db
    .insert(USER)
    .values(user)
    .$returningId()
}

export async function getUserById(userId: number) {
  const result = await db
    .select()
    .from(USER)
    .where(eq(USER.id, userId))
    .limit(1)

  return result[0] || null
}

export async function getUserByUsername(username: string) {
  const result = await db
    .select()
    .from(USER)
    .where(eq(USER.username, username))
    .limit(1)

  return result[0] || null
}

export async function deleteUser(userId: number) {
  return await db
    .delete(USER)
    .where(eq(USER.id, userId))
}
