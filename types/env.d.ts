export declare namespace Env {
  interface ImportMeta extends ImportMetaEnv {
    readonly DATABASE_HOST: string
    readonly DATABASE_PORT: string
    readonly DATABASE_USER: string
    readonly DATABASE_PASSWORD: string
    readonly DATABASE_NAME: string
  }
}

export interface ImportMeta {
  readonly env: Env.ImportMeta
}
