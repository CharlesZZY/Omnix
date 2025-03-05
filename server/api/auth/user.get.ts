import { successResponse, unauthorized } from '~/utils/service'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  return user ? successResponse(user) : unauthorized(event)
})
