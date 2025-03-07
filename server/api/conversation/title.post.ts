import { z } from 'zod'
import { updateConversationTitle } from '~/server/service/conversation'
import { errorResponse, successResponse, unauthorized } from '~/utils/service'

const schema = z.object({
  conversationId: z.string().length(36),
  title: z.string().max(100),
})

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user)
    return unauthorized(event)

  const { success, data, error } = await readValidatedBody(event, schema.safeParse)

  if (!success) {
    return errorResponse(event, 400, error.issues.map(e => e.message).join(', '))
  }

  const { conversationId, title } = data

  const result = await updateConversationTitle(conversationId, title)
  return successResponse(result)
})
