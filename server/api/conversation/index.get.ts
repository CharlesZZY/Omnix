import { getConversationsByUserId } from '~~/server/service/conversation'
import { errorResponse, successResponse, unauthorized } from '~/utils/service'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user)
    return unauthorized(event)

  try {
    const conversations = await getConversationsByUserId(user.id)

    return successResponse({ conversations })
  }
  catch (error: any) {
    return errorResponse(event, 500, error.message || error)
  }
})
