import type { AssistantMessage, UserMessage } from '~/types/chat'
import { desc, eq } from 'drizzle-orm'
import { useDrizzle } from '../database'
import { AI_MESSAGE, CONVERSATION, USER_MESSAGE } from '../database/schema'

const db = useDrizzle()

export async function createConversation(userId: number): Promise<string> {
  const result = await db.insert(CONVERSATION).values({
    userId,
  }).$returningId()
  return result[0].id
}

export async function getConversationsById(conversationId: string) {
  const result = await db
    .select()
    .from(CONVERSATION)
    .where(eq(CONVERSATION.id, conversationId))
    .limit(1)

  return result[0] || null
}

export async function getConversationsByUserId(userId: number) {
  return await db
    .select()
    .from(CONVERSATION)
    .where(eq(CONVERSATION.userId, userId))
    .orderBy(desc(CONVERSATION.createdAt))
}

export async function getMessagesByConversationId(conversationId: string) {
  const userMessages = await db
    .select({
      id: USER_MESSAGE.id,
      content: USER_MESSAGE.content,
      createdAt: USER_MESSAGE.createdAt,
    })
    .from(USER_MESSAGE)
    .where(eq(USER_MESSAGE.conversationId, conversationId))
    .orderBy(USER_MESSAGE.createdAt)

  const aiMessages = await db
    .select({
      id: AI_MESSAGE.id,
      content: AI_MESSAGE.content,
      model: AI_MESSAGE.model,
      createdAt: AI_MESSAGE.createdAt,
    })
    .from(AI_MESSAGE)
    .where(eq(AI_MESSAGE.conversationId, conversationId))
    .orderBy(AI_MESSAGE.createdAt)

  const messages = []
  for (let i = 0; i < userMessages.length; i++) {
    messages.push({
      ...userMessages[i],
      role: 'user',
    })
    if (aiMessages[i]) {
      messages.push({
        ...aiMessages[i],
        role: 'assistant',
      })
    }
  }

  return messages
}

export async function addMessage(conversationId: string, userMessage: UserMessage, aiMessage: AssistantMessage, model: string) {
  await db.insert(USER_MESSAGE).values({
    id: userMessage.id,
    conversationId,
    content: userMessage.content,
  })

  await db.insert(AI_MESSAGE).values({
    id: aiMessage.id,
    conversationId,
    userMessageId: userMessage.id,
    model,
    content: aiMessage.content,
  })
}

export async function deleteConversation(conversationId: string) {
  return await db.delete(CONVERSATION).where(eq(CONVERSATION.id, conversationId))
}

export async function updateConversationTitle(conversationId: string, title: string) {
  return await db.update(CONVERSATION).set({ title }).where(eq(CONVERSATION.id, conversationId))
}
