# Blush Aura

Local React / TypeScript customer storefront and super admin panel, with Java 21 / Spring Boot and a shared PostgreSQL database.

## Open the app

- Customer storefront: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- Super admin: [http://127.0.0.1:5173/admin](http://127.0.0.1:5173/admin)
- API health: [http://127.0.0.1:8081/api/health](http://127.0.0.1:8081/api/health)

The first backend start creates a super admin account. Its randomly generated password is in `backend/.local/admin-credentials.txt`, excluded from Git and readable only by your local account. Email: `admin@blushaura.local`. Admin passwords are stored as BCrypt hashes in PostgreSQL. Session cookies are HTTP-only, expire after 30 minutes of inactivity, and use CSRF protection.

## Run locally

Requirements: Node.js, Java 21, Maven, and Docker Desktop.

```sh
# Generate private local database settings (first run only)
backend/scripts/setup-local.sh

# Start the dedicated local database
docker compose -f backend/compose.yaml up -d --wait

# Start the API in a separate terminal
backend/scripts/run-local.sh

# Start the React app in another terminal
npm install
npm run dev
```

On macOS the backend script chooses Java 21 unless JAVA_HOME is already set. The Vite development/preview servers proxy `/api` to the backend. Open the frontend through Vite. A static `dist` deployment requires an equivalent reverse proxy.

## Customer storefront

Responsive homepage, database-driven categories/subcategories, product search and sorting, product details and uploaded images, browser-local wishlist and cart, delivery form, mock card/PayPal checkout, and order confirmation. Checkout calculates prices and shipping on the server and saves orders transactionally. Stock is checked and reduced atomically. The storefront refreshes its catalogue when the window regains focus; reload to see changes made elsewhere.

## Super admin

- Overview: demo order value, order counts, active products and low-stock alerts.
- Products: create and edit names, descriptions, prices, inventory, category, subcategory, image, badge and sort order. Publish, draft or archive products. Archiving preserves order history.
- Images: JPEG/PNG uploads up to 5 MB, validated and re-encoded on the backend, stored in PostgreSQL alongside the catalogue. Before uploading, drag the crop area or its corner handles directly, choose Square / Portrait / Landscape / Original / Free crop, and check the final preview. Output dimensions adjust automatically; no pixel sizes need to be entered. Choose “Fit whole image” to preserve the full source with white padding instead. Adjust image size for extra white space. Existing uploaded images can also be cropped/resized. Illustrations remain available as fallbacks.
- Categories: create, rename and remove unused categories and manage subcategories. Category renames cascade to products. Products must be reassigned before removing a category/subcategory they use, including drafts.
- Orders: paginated order list, delivery details, line items and fulfillment updates. Allowed flow: NEW → PROCESSING → SHIPPED → COMPLETED. NEW/PROCESSING orders can be cancelled, restoring inventory once.
- Sign-in and sign-out. All `/api/admin/**` operations require the super admin role; product images and published catalogue reads are public.

## One database

Customer and admin use **the same database**, `blushaura`. Products, categories, inventory, uploaded image bytes, orders, order items and admin credentials all live there. No separate admin database exists.

The dedicated Compose project is `blushaura-local`. PostgreSQL is bound to `127.0.0.1:55432` with its own named volume. Local database/user: `blushaura`. The setup script generates a private database password in ignored `backend/.local/database.properties` and `backend/.local/postgres.env` files. Existing local database credentials remain in those files. Override the backend with `DB_URL`, `DB_USER`, `DB_PASSWORD`, `PORT`. Keep the database and backend credentials consistent when overriding them.

Stop without deleting data:

```sh
docker compose -f backend/compose.yaml down
```

Flyway migrations are in `backend/src/main/resources/db/migration`. Existing product and order records are retained when the admin migration is applied. Credentials are generated only when no admin exists; deleting the credentials file does not reset the database password.

## Formatting and checks

Frontend uses **Prettier** with `.prettierrc.json`. Backend uses **Spotless** with Google Java Format, enforced during Maven's `validate` phase.

```sh
# Frontend: format, check formatting, build
npm run format
npm run format:check
npm run build

# Backend: format and validate/test
cd backend
mvn spotless:apply
mvn test

# Include integration tests against the running local database
BLUSHAURA_INTEGRATION_TESTS=true mvn verify
```

Integration tests verify authentication, role enforcement, CSRF, image uploads, shared catalogue visibility, server pricing, inventory and cancellation. Test category/product/order changes are rolled back. They can apply migrations and bootstrap the local admin account if the database is fresh.

## IDEs

- **VS Code:** open the repository root. The backend folder is hidden in Explorer/search to keep frontend work focused. The recommended Prettier extension enables format-on-save.
- **IntelliJ IDEA:** open `backend/pom.xml` as a Maven project, select JDK 21, and run `com.blushaura.api.BlushAuraApplication`. Start PostgreSQL first. Use `mvn spotless:apply` to match the project's Java formatting.

## Current scope

Everything runs locally and is independent of professional/banking projects. Payments remain mocked; no charge, email or delivery is initiated. Order values are demo activity. Delivery data entered during checkout is saved in the local database; use sample details while developing. Customer accounts, cross-device wishlist/cart, taxes, refunds, real gateways, production hardening and deployment remain future work. Newsletter signup is a preview.
