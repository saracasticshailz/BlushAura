# Deploy Blush Aura

The release serves the React customer storefront and admin panel from the same Spring Boot process. Both use one PostgreSQL database, including product images. No cross-origin browser credentials or separate frontend API URL is required.

## Prepared files

- `Dockerfile`: Node frontend build, Java 21 Maven verification, non-root Java runtime.
- `render.yaml`: one Free Docker web service. It does not provision an expiring Render database.
- `backend/src/main/resources/application-prod.yml`: public interface/host port, HTTPS session cookie, required database secrets, small connection pool.
- Maven profile `frontend`: packages `dist/` into the Spring Boot jar.

## Accounts and source

Use personal or dedicated Blush Aura accounts for Render, Neon and your Git provider. This repository currently has no Git remote. Publish its source to a private project repository before linking it to Render. Do not include `.local`, `.env`, screenshots, database dumps or credentials.

## Shared database

Create a Neon Free project for Blush Aura. Obtain its PostgreSQL hostname, database, username and password. Set the following Render runtime secrets (not Docker build arguments):

- `DB_URL`: `jdbc:postgresql://YOUR-NEON-HOST/YOUR-DATABASE?sslmode=require`
- `DB_USER`: the Neon database role.
- `DB_PASSWORD`: the Neon role password.

The URL is a JDBC URL, not the `postgresql://user:password@...` URL shown by some consoles. Keep passwords in separate secret fields.

Flyway initializes a new database with the catalogue and schema. This does not copy local product edits, uploaded images or customer records into the hosted database.

## Render

Create a Blueprint from the project repository using `render.yaml`, or create a Docker Web Service using the root Dockerfile and choose Free. Set the database values above. The Blueprint generates `ADMIN_PASSWORD` and uses `admin@blushaura.local` as `ADMIN_EMAIL`. Store the generated password securely from Render's environment settings. The hosted app never writes an admin credential file or prints the password.

`ADMIN_PASSWORD` initializes an admin only when the database has no admin users; changing this variable later does not reset an existing account. The production profile requires a configured secret of at least 16 characters and at most 72 UTF-8 bytes.

The service listens on `0.0.0.0:$PORT`. Readiness path: `/api/ready` (checks the database). Liveness path: `/api/health`.

After deployment succeeds, use the URL returned by Render:

- `/`: customer storefront
- `/admin`: admin sign-in
- `/api/ready`: deployment readiness

Verify an admin sign-in, catalogue reads, product/image edits and a sample checkout against the deployed app before sharing the release. Do not claim a public URL until Render reports a successful deployment and those routes respond.

## Local release build

```sh
npm ci
npm run build
JAVA_HOME=$(/usr/libexec/java_home -v 21) mvn -f backend/pom.xml -Pfrontend verify
```

Docker alternative:

```sh
docker build -t blushaura:release .
```

The hosted profile enables Secure session cookies and is intended to be served behind HTTPS. Normal local development continues to use `npm run dev` and `backend/scripts/run-local.sh`.

## Free-plan scope

Render Free can sleep when idle; Neon Free has usage/storage quotas. Payments remain mocked. All uploaded images count against the shared database's storage. Do not enable paid resources automatically.
