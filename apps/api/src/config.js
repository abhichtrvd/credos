const required = (value, name) => { if (!value) throw new Error(`${name} is required`); return value; };

export const loadConfig = (env = process.env) => {
  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port');
  const environment = env.NODE_ENV || 'development';
  if (environment === 'production') required(env.DATABASE_URL, 'DATABASE_URL');
  if (environment === 'production' && (!env.JWT_SECRET || env.JWT_SECRET === 'local-development-secret')) throw new Error('a non-development JWT_SECRET is required');
  return { environment, port, databaseUrl: env.DATABASE_URL || null, redisUrl: env.REDIS_URL || null, jwtSecret: env.JWT_SECRET || 'local-development-secret' };
};
