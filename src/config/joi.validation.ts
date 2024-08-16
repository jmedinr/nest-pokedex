import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
    MONGODB: Joi.required(),
    PORT: Joi.number().default(3005),
    DEFAULT_LIMIT: Joi.number().default(10),
    DEFAULT_OFFSET: Joi.number().default(0),
    API_VERSION: Joi.string().default('api/v1'),
})
