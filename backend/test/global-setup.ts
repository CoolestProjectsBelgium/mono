import 'reflect-metadata';

export default async () => {
  // Set environment variables for testing
  process.env.DB_NAME = process.env.DB_NAME_TEST;
  process.env.DB_HOST = process.env.DB_HOST_TEST;
  process.env.DB_PORT = process.env.DB_PORT;
  process.env.DB_USER = process.env.DB_USER_TEST;
  process.env.DB_PASS = process.env.DB_PASS_TEST;
};
