
declare namespace NodeJS {
  export interface ProcessEnv {
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string
    NEXT_AUTH_AWS_REGION: string
    NEXT_AUTH_AWS_ACCESS_KEY: string
    NEXT_AUTH_AWS_SECRET_KEY: string
    GITHUB_ID: string
    GITHUB_SECRET: string
    // GITHUB_ACCESS_TOKEN: string
    // FACEBOOK_ID: string
    // FACEBOOK_SECRET: string
    // TWITTER_ID: string
    // TWITTER_SECRET: string
    // GOOGLE_ID: string
    // GOOGLE_SECRET: string
    // AUTH0_ID: string
    // AUTH0_SECRET: string
  }
}