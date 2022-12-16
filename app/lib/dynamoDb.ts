export const config = {
  region: process.env.NEXT_AUTH_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AUTH_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_AUTH_AWS_SECRET_ACCESS_KEY,
  },
};
