import { init } from "@sentry/nextjs";

export default init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  enabled: !!process.env.SENTRY_DSN,
});
