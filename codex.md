# rizz — project history and resumption notes

Last updated: 31 October 2026, Asia/Dubai.

This file records the implemented work and the context needed to resume it. Read this file, `README.md`, and any applicable `AGENTS.md` before making changes. Keep this file current after meaningful implementation or deployment work. Never store passwords, tokens, connection strings containing credentials, session cookies, or customer details here.

## Project scope and user decisions

- The project started from scratch as **Blush Aura**, a massage and self-care ecommerce application. The current configurable UI name is **rizz**.
- The user requested a React frontend, Java / Spring Boot backend, PostgreSQL, a customer storefront, and a super admin panel.
- Customer and admin belong to one application and share one backend and one database per environment. Local and hosted environments have separate databases.
- Payments are mocked. No real PayPal or card gateway has been integrated, and checkout must not charge money.
- MyMuse was supplied as a product/style reference. The implementation uses its own layout, copy, and SVG product illustrations.
- Keep this personal project entirely separate from the user's professional/banking work, accounts, repositories, and data. Use only the project's personal service connections.
- The user requested Atomic Design, Redux Toolkit / RTK Query, Prettier in the frontend, and Spotless in the backend.
- The user authorized publishing the source and deploying the app. Hosting has been kept on free plans; paid resources or plan upgrades need explicit authorization.

## Current application and source

| Item                     | Location                                            |
| ------------------------ | --------------------------------------------------- |
| Local repository         | `/Users/shailesh_adcb/Documents/ChatGPT/BLUSHAURA-` |
| Public GitHub repository | <https://github.com/saracasticshailz/BlushAura>     |
| Customer URL             | <https://rizz-blushaura.onrender.com/>              |
| Admin URL                | <https://rizz-blushaura.onrender.com/admin>         |
| Readiness URL            | <https://rizz-blushaura.onrender.com/api/ready>     |
| Local customer URL       | <http://127.0.0.1:5173/>                            |
| Local admin URL          | <http://127.0.0.1:5173/admin>                       |
| Local API                | <http://127.0.0.1:8081>                             |

The source repository is public. Review all candidate files for credentials and private data before publishing. The existing `.gitignore` and `.dockerignore` exclude local credentials, environment files, build outputs, and project-private directories.

## Work completed from scratch

1. Built the responsive customer storefront: homepage, category/subcategory navigation, product cards and details, search, sorting, wishlist, shopping bag, delivery details, mock payment selection, and order confirmation.
2. Added the Spring Boot API, PostgreSQL schema, Flyway migrations, seed catalogue, and server-side order calculation. Inventory is checked and decremented transactionally. Prices and shipping are calculated by the server.
3. Added the super admin flow: sign-in/out, dashboard, product create/edit/archive, categories/subcategories, inventory, uploaded images, order list/details, and fulfillment updates.
4. Connected customer and admin to the same database. Admin catalogue changes appear in customer queries; customer orders appear in admin.
5. Secured admin endpoints with the `SUPER_ADMIN` role, BCrypt password hashes, HTTP-only session cookies, a 30-minute inactivity timeout, and CSRF protection for mutations including login and checkout.
6. Added product-image uploads: JPEG/PNG validation and re-encoding in Java, up to 5 MB, with image bytes stored in PostgreSQL. Added resize controls, white padding, direct drag/handle cropping, aspect presets, automatic output sizing, and a larger crop view. Users do not need to enter pixel dimensions.
7. Added FE Prettier and BE Spotless / Google Java Format. Spotless is enforced by Maven validation.
8. Prepared a multi-stage Docker release, production Spring profile, readiness/liveness endpoints, Render Blueprint, and Railway configuration. Production serves React and API from the same Spring Boot process.
9. Published the project to the personal GitHub repository. Removed tracked default database credentials; local setup generates ignored private settings instead.
10. Made branding configurable through `src/brand.defaults.json`, `src/config.ts`, and the optional `VITE_APP_NAME` build setting. Renamed the UI to **rizz**. The original package names, database name, and Java namespace retain `blushaura`.
11. Refactored React into Atomic Design and introduced a single Redux Provider, customer/admin UI slices, and one shared RTK Query API/cache. Added component-boundary and shared-workflow tests.
12. Added local startup, architecture, and deployment Markdown guides.
13. Tried Railway using the personal account. Project creation was blocked with “Your trial has expired. Please select a plan to continue using Railway.” No paid Railway plan was selected and no rizz Railway project was provisioned.
14. Deployed the combined app to **Render Free** with a dedicated **Neon Free PostgreSQL 17** database in Singapore. The user explicitly approved transferring the new database credentials and generated admin password into Render environment settings. These secrets remain outside GitHub and chat.
15. Verified the first hosted release: public pages, readiness, admin auth, shared category changes, mock checkout, cancellation, and stock restoration. The temporary test category was removed. One cancelled **Deployment Check** order remains as a verification record.
16. Added a **View bag** button to the add-to-cart confirmation. The actionable confirmation lasts eight seconds. It opens the cart drawer and closes product/search overlays. Other notices retain their shorter timeout. Local product-card and product-dialog flows were verified, with the test cart restored afterward.
17. Added homepage feature carousels, mixed image/video product galleries, a portrait shoppable rituals rail, larger typography, scroll reveals, card feedback, a controllable moving ribbon, and admin overview entrance motion. Admin product editors support up to eight ordered gallery items with captions: cropped JPEG/PNG up to 5 MB and MP4/WebM up to 20 MB. Flyway V3 stores gallery metadata in JSONB; upload bytes stay in the shared database. Media responses support byte ranges. See [docs/MEDIA_GALLERIES.md](docs/MEDIA_GALLERIES.md).

## Frontend architecture

Stack: React 19, TypeScript, Vite, Redux Toolkit, React Redux, RTK Query, and Lucide icons. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

```text
src/
  main.tsx                      React root, StrictMode, shared Redux Provider
  App.tsx                       Customer/admin route selection; lazy admin bundle
  components/
    atoms/                      Button, Badge, BrandLogo, ProductImage, ProductArt
    molecules/                  Cards, grids, quantity/search controls, notices, CropSelector
    organisms/storefront/       Header, footer, bag, product/search dialogs, StoreToast
    organisms/admin/            Admin navigation, tables, editors, confirmations
    organisms/media/            Image crop/resize/upload editor
    templates/                  StorefrontTemplate, AdminTemplate
  pages/                        Customer/admin composition and individual screens
  hooks/                        useStorefront, useAdmin feature controllers
  store/                        Store, typed hooks, storefrontSlice, adminSlice
  services/                     storeApi RTK Query endpoints; CSRF-aware http transport
  types/                        Product and admin domain types
  data/                         Preview catalogue and admin form defaults
  utils/                        Currency and date formatting
```

- Components receive typed props and callbacks; reusable UI does not fetch data or subscribe to Redux.
- Lower Atomic layers must not import higher layers.
- `storefrontSlice` owns cart/wishlist, navigation, filters, dialogs, notifications, and checkout UI state. Only cart/wishlist are persisted using the existing `blushaura.cart` and `blushaura.wishlist` browser keys.
- `adminSlice` owns admin view, search, and pagination.
- `storeApi` owns server data and cache tags (`Products`, `Categories`, `Orders`, `Dashboard`). Mutations invalidate related customer and admin queries.
- Each browser tab has its own runtime Redux store; queries refresh on focus/reconnect.
- Form drafts and crop interaction state stay local to their controllers/editors. Passwords, image `File` values, and `FormData` are not placed in Redux actions or persisted state.
- Login and uploads use `src/services/http.ts` directly; the same transport manages CSRF for RTK Query.
- Admin logout clears private API cache/admin UI state while preserving the customer's cart/wishlist.
- Branding source of truth is `src/brand.defaults.json`; Docker can also receive `VITE_APP_NAME` as a build argument.
- The cart-confirmation implementation is in `StoreToast.tsx`, `useStorefront.ts`, `storefrontSlice.ts`, and `src/styles.css`.

## Backend and database

Stack: Java 21, Spring Boot 3.5.12, Maven, Spring Security, JDBC, Flyway, and PostgreSQL 17. Backend sources are under `backend/src/main/java/com/blushaura/api`.

- Migrations: `backend/src/main/resources/db/migration` (V1 store schema/catalogue, V2 admin/catalogue/inventory, V3 ordered product media galleries).
- Shared records include products, categories/subcategories, media, orders/order items, and admin users.
- Images are stored as database bytes, so app filesystem resets do not lose uploaded images.
- Product archive preserves order history. Category removal requires products to be reassigned, including drafts.
- Order fulfillment: `NEW → PROCESSING → SHIPPED → COMPLETED`. `NEW` / `PROCESSING` can be cancelled; cancellation restores inventory only once.
- Shipping: INR 99 below INR 1,999; free at or above that total.
- Checkout persists mock-confirmed orders; it does not contact a payment gateway.
- Production binds to `0.0.0.0:$PORT`, trusts forwarded headers, uses Secure session cookies, limits the connection pool, and requires a configured admin bootstrap secret.
- `ADMIN_PASSWORD` initializes an account only if no admin exists. Editing that variable or deleting a credentials file does not reset an existing account password.

Important routes:

| Area             | Routes                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Health           | `GET /api/health`, `GET /api/ready` (database check)                                         |
| Public catalogue | `GET /api/products`, `/api/products/{id}`, `/api/categories`, `/api/media/{uuid}`            |
| Customer order   | `POST /api/orders`                                                                           |
| Security         | `GET /api/csrf`, `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/session` |
| Admin            | `/api/admin/dashboard`, `/products`, `/categories`, `/orders`, `/media`                      |

Consult [backend/README.md](backend/README.md) for methods/payloads. Admin routes require authentication; browser frontend and API share an origin and do not require a separate cross-origin setup.

## Local startup and IDEs

Requirements: Docker Desktop, Node/npm, JDK 21, Maven. From the repository root:

```sh
backend/scripts/setup-local.sh
docker compose -f backend/compose.yaml up -d --wait
backend/scripts/run-local.sh
```

In a second terminal:

```sh
npm install
npm run dev
```

- Docker Compose project: `blushaura-local`. PostgreSQL is bound to `127.0.0.1:55432`, with database/user `blushaura` and a dedicated named volume.
- `setup-local.sh` generates private database settings on first use and preserves existing settings.
- `run-local.sh` chooses Java 21 on macOS unless `JAVA_HOME` is already set and starts from the backend working directory.
- Vite proxies `/api` to port 8081. A separately hosted static build would need an equivalent API proxy; the current combined release avoids that requirement.
- Open the repository in VS Code for frontend work. Open `backend/pom.xml` in IntelliJ, import Maven, use JDK 21 and the backend working directory, then run `BlushAuraApplication`.
- Do not run the backend from IntelliJ and the script simultaneously on the same port.
- Stop FE/BE with `Ctrl+C`; use `docker compose -f backend/compose.yaml down` to stop PostgreSQL without deleting data.
- Localhost URLs refer to the device opening them. Share the hosted URL for mobile/remote access.

Detailed instructions: [docs/LOCAL_START.md](docs/LOCAL_START.md).

## Credential locations — no values in this file

- Local database: ignored `backend/.local/database.properties` and `backend/.local/postgres.env`.
- Local admin: ignored `backend/.local/admin-credentials.txt`.
- Hosted admin: ignored `backend/.local/render-admin-credentials.txt`; generated separately from the local password. File permissions are restricted to the local user.
- Admin email currently used in both environments: `admin@blushaura.local`.
- Hosted database and admin secrets are configured in Render environment settings.
- Never publish `.local`, `.env` files, database dumps, or secret-bearing screenshots. Do not print secrets in tool output or commit them to fixtures/documentation.

## Hosted resources and deployment

| Resource               | Identifier                                                  |
| ---------------------- | ----------------------------------------------------------- |
| Render workspace       | `Blushaura`, `tea-dbigbetg1s2s73cas18g` (user confirmed)    |
| Render web service     | `rizz-blushaura`, `srv-dbigd4utlv9c73eib370`                |
| Render dashboard       | <https://dashboard.render.com/web/srv-dbigd4utlv9c73eib370> |
| Neon organization      | `Shailesh`, `org-soft-flower-12508254` (Free)               |
| Neon project           | `rizz`, `gentle-tree-95697350`                              |
| Neon production branch | `br-rapid-art-a1zzn0po`                                     |
| Hosted database / role | `rizz` / `rizz_owner`                                       |
| Region                 | Render Singapore / Neon `aws-ap-southeast-1`                |

- One Render Free Docker service serves the FE, admin, and BE. One Neon Free database is shared by both flows.
- The initial hosted database used the seed catalogue. No local database dump or customer data was migrated.
- `Dockerfile`: Node 22 builds React; Maven / Java 21 verifies and packages it using `-Pfrontend`; a non-root JRE container runs the jar.
- Runtime variables: `SPRING_PROFILES_ACTIVE=prod`, `PORT`, `DB_URL` (JDBC with SSL), `DB_USER`, `DB_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- `render.yaml` is a prepared Blueprint, but the current service was created directly through Render. It is not managed by Blueprint sync; changing that file alone does not update the service settings.
- **Deploy explicitly after publishing.** The service reports auto-deploy enabled, but a push did not trigger a release in the observed workflow. It was created from the public Git URL. Check deploy history and the desired commit before triggering a manual deploy; avoid duplicate deploys if one already exists.
- Monitor the specific deploy ID to `live`, then verify readiness and the affected behavior. A queued build or assigned URL alone is not evidence of successful deployment.
- Render Free sleeps after inactivity; a cold visit can take about a minute. Free usage quotas apply. Do not upgrade or create paid resources without authorization.
- Neon Free rejected an attempt to customize the suspend interval. Project creation succeeded after omitting that setting. Do not retry unsupported settings unchanged.
- Railway configuration remains in `railway.json` for future use, but Railway is not hosting this release.

Further details: [docs/HOSTED_APP.md](docs/HOSTED_APP.md), [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Checks and verification

Frontend:

```sh
npm test
npm run build
npm run format:check
```

Backend:

```sh
cd backend
mvn spotless:apply
mvn test
BLUSHAURA_INTEGRATION_TESTS=true mvn verify
```

Combined release, after building the frontend:

```sh
JAVA_HOME=$(/usr/libexec/java_home -v 21) mvn -f backend/pom.xml -Pfrontend verify
```

- Latest frontend suite: 9 tests passed, covering legacy cover compatibility and mixed-gallery ordering alongside the existing Atomic/shared-workflow checks. Production build, Prettier, and Spotless passed.
- FE tests cover Atomic dependency direction, no network/Redux subscriptions in reusable UI, shared catalogue invalidation, checkout cache updates, failed mutation behavior, and customer-state preservation across admin navigation.
- Latest gallery backend integration verification: 21 tests, zero failures/errors/skips, against the dedicated local PostgreSQL database. Run Maven from `backend/` for private local configuration to load. Normal builds skip database integration tests unless `BLUSHAURA_INTEGRATION_TESTS=true` is set.
- The initial hosted workflow was separately verified over HTTPS, including actual shared-database operations and cancellation/restocking.
- For the View bag change, local browser checks covered additions from a product card and a product detail dialog; clicking the action opened the bag with the item and removed the product overlay.
- Gallery browser QA uploaded an original H.264 portrait clip and two cropped images, reordered/saved them in admin, and verified a customer video with 360×640 decoded dimensions, mute/inline playback and no video error. Product image navigation also worked. The original local product was restored from an ignored QA backup. Fixtures/tooling remain outside tracked source.
- The IAB viewport capability accepted a phone-size override but still reported a 1280-pixel viewport. The override was reset; do not describe that attempt as a completed mobile viewport verification. Responsive CSS is present, but real-device checks remain useful.

## Release history and current work

| Commit    | Result                                                                                                            |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| `a10ac52` | Initial storefront, admin, Spring Boot API and deployment configuration                                           |
| `9c7baac` | Configurable rizz branding and Railway configuration                                                              |
| `82f3127` | Atomic Design, shared Redux Toolkit / RTK Query, startup/architecture docs; first live Render application release |
| `4db5203` | Hosted URLs and admin-access documentation                                                                        |
| `dd424ec` | View bag action after add-to-cart; FE tests/build/formatting passed                                               |

Latest cart-change deploy: `dep-dbigntfb9u1s73c3il3g`, targeting `dd424ec7e5244c2a9e2c8343400235f55ebb401c`. Render reported this deploy live. The hosted storefront was opened in a browser; adding Aura displayed the View bag action, clicking it opened the bag with Aura, and the test item was then removed. Browser warning/error logs were empty. The user also requested this root codex.md as durable, version-controlled project memory; it links the existing guides and records the work from scratch.

## Resume checklist and remaining scope

1. Read this file and applicable repository instructions, inspect `git status`, and preserve unrelated user changes.
2. Confirm the current user request; inspect source before relying on these notes if implementation has changed.
3. Use the connected personal GitHub/Render/Neon tools where available. Do not fall back to professional GitHub CLI credentials. The public remote can be fetched without a credential helper.
4. For source publication, include intended new/changed/deleted files, scan for secrets, preserve concurrent remote commits, and use a non-forced update with an expected branch head. Never use a hard reset to discard working files.
5. Do not rely on temporary `/private/tmp` scripts or tool-session variables; they are not durable project dependencies. Recreate focused checks from source/docs as needed.
6. Run checks appropriate to the change. Monitor deployment and verify the live affected workflow before claiming completion.
7. Update this file with the actual result, new decisions, meaningful limitations, and what remains.

Remaining scope is not implicitly authorized for implementation: real payments, production email/newsletter/support integrations, customer accounts, local-to-hosted data migration, custom domains, and paid/always-on hosting. The current app is a demo release. Some existing UI helper text still refers to local development (including the admin sign-in credential hint); use this document's hosted credential path for the live deployment.
