const clientEnv = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
};

const serverEnv = {
  API_BASE_URL: process.env.API_BASE_URL ?? clientEnv.NEXT_PUBLIC_API_BASE_URL,
};

export const env = {
  ...clientEnv,
  ...serverEnv,
};

