import { z } from 'zod'
import { createUser, getUserById } from '~~/server/service/user'
import { badRequest, internalServerError, successResponse } from '~/utils/service'

const schema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
})

export default defineEventHandler(async (event) => {
  const { success, data, error } = await readValidatedBody(event, body => schema.safeParse(body))

  if (!success)
    return badRequest(event, error.issues.map(e => e.message).join(', '))

  try {
    const hashedPassword = await hashPassword(data.password)
    const userId = await createUser({
      ...data,
      password: hashedPassword,
    })
    const user = await getUserById(userId[0].id)
    return successResponse({ ...user, password: undefined }, 'User registered successfully')
  }
  catch (error: any) {
    return error.code === 'ER_DUP_ENTRY' ? badRequest(event, 'Username or email already exists') : internalServerError(event, error.message || error)
  }
})
