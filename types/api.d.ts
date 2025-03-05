export declare namespace Api {
  interface Response<T = null> {
    success: boolean
    data?: T
    error?: string
    message?: string
  }

  interface CreateUserParams {
    username: string
    password: string
    email: string
  }
}
