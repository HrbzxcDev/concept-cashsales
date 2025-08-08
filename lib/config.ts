const config = {
  env: {
    prodApiEndpoint: process.env.NEXT_PUBLIC_PROD_API_ENDPOINT!,
    DevApiEndpoint: process.env.NEXT_PUBLIC_DEV_API_ENDPOINT!,
    upstash: {
      redisUrl: process.env.UPSTASH_REDIS_URL!,
      redisToken: process.env.UPSTASH_REDIS_TOKEN!,
      qstashUrl: process.env.NEXT_PUBLIC_QSTASH_URL!,
      qstashToken: process.env.NEXT_PUBLIC_QSTASH_TOKEN!,
    },
    // resendToken: process.env.RESEND_TOKEN!,
    databaseUrl: process.env.DATABASE_URL!,
    ResendToken: process.env.RESEND_TOKEN!,
  }
};

export default config;
