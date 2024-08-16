export const EnvironmentConfiguration = () => ({
  mongodb: process.env.MONGODB,
  port: process.env.PORT || 3001,
  apiVersion: process.env.API_VERSION || 'api/v1',
  defaultLimit: +process.env.DEFAULT_LIMIT || 10,
  defaultOffset: +process.env.DEFAULT_OFFSET || 0,
});
