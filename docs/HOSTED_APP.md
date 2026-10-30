# Live rizz app

Deployed on 31 October 2026 (Asia/Dubai).

- Customer storefront: <https://rizz-blushaura.onrender.com/>
- Admin panel: <https://rizz-blushaura.onrender.com/admin>
- Database readiness: <https://rizz-blushaura.onrender.com/api/ready>
- Render dashboard: <https://dashboard.render.com/web/srv-dbigd4utlv9c73eib370>

Share the customer storefront URL with your partner. It works independently of your local development server.

## Admin sign-in

Open the admin panel and enter `admin@blushaura.local`. The generated hosted password is stored privately on this computer in `backend/.local/render-admin-credentials.txt`. It is different from the local development password. Do not commit or share this file publicly.

The same secret is configured as `ADMIN_PASSWORD` in the Render service environment. Changing that variable does not reset an existing admin account's password.

## Hosting and data

- Render Free runs the React customer UI, React admin panel, and Java Spring Boot API together.
- Neon Free provides a dedicated PostgreSQL 17 database in Singapore. Both customer and admin use this same hosted database.
- Product images are stored in PostgreSQL, so they survive app restarts.
- The hosted database was initialized with the seed catalogue. Local product edits, images, and orders have not been copied to it.
- Payments remain mocked; no money is charged.
- Render can sleep after 15 minutes without traffic. The first visit afterward can take about a minute to load. Free service quotas apply.

## Verified after deployment

- Customer and admin pages return successfully over HTTPS.
- API liveness and database readiness pass.
- Admin sign-in, session, protected APIs, and logout work.
- A temporary admin category appeared in the customer catalogue and was removed after the check.
- A mock customer order appeared in admin. It was cancelled and inventory was restored. One cancelled order named **Deployment Check** remains as a verification record.

## Updates

The app deploys from the `main` branch of <https://github.com/saracasticshailz/BlushAura>. The current service uses a public Git URL; a push did not trigger deployment in the observed workflow even though the service reports auto-deploy enabled. Check deployment history after publishing, and trigger a manual deploy if the intended commit has no deployment. Confirm readiness before sharing a new release.

Local startup instructions are in [LOCAL_START.md](LOCAL_START.md).
