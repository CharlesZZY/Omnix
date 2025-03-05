declare module '#auth-utils' {
  interface User {
    id: number
    username: string
    email: string
  }

  interface UserSession {
    // Add your own fields
  }

  interface SecureSessionData {
    // Add your own fields
  }

  interface UserSessionRequired {
    id: any
    user: User
    secure?: SecureSessionData
  }
}

export {}
