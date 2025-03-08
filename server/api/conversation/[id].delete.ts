import { z } from 'zod'
import { deleteConversation } from '~~/server/service/conversation'
import { badRequest, errorResponse, successResponse, unauthorized } from '~/utils/service'

const schema = z.object({
  id: z.string(),
})

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user)
    return unauthorized(event)

  const { success, data, error } = await getValidatedRouterParams(event, schema.safeParse)

  if (!success) {
    return badRequest(event, error.issues.map(e => e.message).join(', '))
  }

  try {
    const res = await deleteConversation(data.id)
    return successResponse({ res })
  }
  catch (error: any) {
    return errorResponse(event, 500, error.message || error)
  }
})
