import * as Joi from "joi";

export const configSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),
  PORT: Joi.number().default(3000),

  API_PREFIX: Joi.string().default("api/v1"),

  CORS_ORIGINS: Joi.string().allow("").default(""),

  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),

  DATABASE_URL: Joi.string().required(),
}).unknown(true);
