export default () => ({
  enviroment: process.env.NODE_ENV,
  database: {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!, 10) || 3306,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  mailing: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT!, 10) || 1025,
    from: process.env.SMTP_FROM,
    imap_user: process.env.IMAP_USER,
    imap_password: process.env.IMAP_PASSWORD,
    imap_port: parseInt(process.env.IMAP_PORT!, 10) || 993,
  },
  adminjs : {
    secret: process.env.ADMINJS_COOKIE_SECRET,
    port: parseInt(process.env.ADMINJS_PORT!, 10) || 3306,
  },
  cookies: {
    domain: process.env.COOKIE_DOMAIN
  },
  api: {
    jwt: process.env.JWT_KEY,
    expires: process.env.JWT_EXPIRES,
    port: parseInt(process.env.API_PORT!, 10) || 3001,
    csrf: process.env.CSRF_SECRET,
    cors_origin: process.env.CORS_ORIGINS,
    base_url: process.env.API_BASE_URL,  
    upload_root: process.env.UPLOAD_ROOT
  },
  cron: {
    mail: process.env.CRON_JOB_MAIL,
    bounce: process.env.CRON_JOB_BOUNCE,
  },
  voting: {
    jwt: process.env.VOTING_KEY,
    expires: process.env.JWT_EXPIRES,
  }
});