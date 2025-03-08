import { z } from 'zod'
import { getUserByUsername } from '~~/server/service/user'
import { badRequest, internalServerError, successResponse, unauthorized } from '~/utils/service'

const schema = z.object({
  username: z.string().max(50),
  password: z.string(),
})

export default defineEventHandler(async (event) => {
  const { success, data, error } = await readValidatedBody(event, schema.safeParse)

  if (!success)
    return badRequest(event, error.issues.map(e => e.message).join(', '))

  const user = await getUserByUsername(data.username)

  if (!user)
    return unauthorized(event, '用户名或密码错误')

  try {
    if (await verifyPassword(user.password, data.password)) {
      await setUserSession(event, { user: { id: user.id, username: user.username, email: user.email } })
      return successResponse(null, 'Login successful')
    }
  }
  catch (error: any) {
    return internalServerError(event, error.message || error)
  }
})
