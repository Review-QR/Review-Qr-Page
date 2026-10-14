# Protected Preview Cashfree callbacks

Cashfree's documented Create Order request accepts `order_meta.notify_url` as a URL. Its documented order metadata has no field for custom webhook request headers. Vercel's automation bypass can be passed in a header, but Cashfree cannot be configured to send that header for this callback. Putting `VERCEL_AUTOMATION_BYPASS_SECRET` in `notify_url` would transmit a project-wide deployment-protection credential to Cashfree and expose it in a URL.

The Preview application therefore fails closed: it does not generate a Cashfree webhook URL or create a Sandbox checkout order while the only callback target is the protected Preview deployment. The bypass secret is never appended to a URL or sent to Cashfree. Production routing is unchanged.

Resume Preview webhook testing only after an approved callback architecture can deliver Cashfree events to the Preview handler without sharing a Vercel bypass secret with Cashfree or weakening Deployment Protection. No migration or project setting change is included in this code change.
