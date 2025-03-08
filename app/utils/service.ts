import type { H3Event } from 'h3'
import type { Api } from '~/types/api'
import type { Env } from '~/types/env'
import { setResponseStatus } from 'h3'

export function createServiceConfig(env: Env.ImportMeta) {
  const { DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME } = env
  return {
    database: {
      host: DATABASE_HOST || 'localhost',
      port: Number(DATABASE_PORT || '3306'),
      user: DATABASE_USER || 'root',
      password: DATABASE_PASSWORD || 'password',
      database: DATABASE_NAME || 'omnix',
    },
  }
}

export function successResponse<T>(data?: T, message?: string): Api.Response<T> {
  return { success: true, data, message }
}

export function errorResponse(event: H3Event, status: number, error: string, message?: string): Api.Response<null> {
  setResponseStatus(event, status, message || error)
  return { success: false, error, message }
}

export function badRequest(event: H3Event, error: string, message?: string) {
  return errorResponse(event, 400, error, message || 'Bad Request')
}

export function unauthorized(event: H3Event, error: string = 'Unauthorized', message?: string) {
  return errorResponse(event, 401, error, message || '请先登录')
}

export function forbidden(event: H3Event, error: string = 'Forbidden', message?: string) {
  return errorResponse(event, 403, error, message || '您无权访问该资源')
}

export function notFound(event: H3Event, error: string = 'Not Found', message?: string) {
  return errorResponse(event, 404, error, message || '资源不存在')
}

export function internalServerError(event: H3Event, error: string = 'Internal Server Error', message?: string) {
  return errorResponse(event, 500, error, message || '服务器错误，请稍后重试')
}
