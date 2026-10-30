# Blush Aura API

Java 21, Spring Boot 3.5.12, Maven, PostgreSQL, Flyway, JDBC.

From the repository root:

```sh
backend/scripts/setup-local.sh
docker compose -f backend/compose.yaml up -d --wait
backend/scripts/run-local.sh
```

Or open this folder / `pom.xml` in IntelliJ IDEA, select JDK 21, import Maven dependencies and run `BlushAuraApplication`.

| Method | Endpoint             | Purpose                           |
| ------ | -------------------- | --------------------------------- |
| GET    | `/api/health`        | Application liveness              |
| GET    | `/api/products`      | Active catalogue                  |
| GET    | `/api/products/{id}` | Product details                   |
| GET    | `/api/categories`    | Categories and subcategories      |
| POST   | `/api/orders`        | Validate and persist a mock order |

Example checkout payload (sample data only):

```json
{
  "address": {
    "name": "Demo Customer",
    "email": "demo@example.com",
    "street": "123 Example Street",
    "city": "Demo City",
    "postal": "100001",
    "country": "India"
  },
  "paymentMethod": "paypal",
  "items": [{ "productId": "aura", "quantity": 1 }]
}
```

The client cannot specify prices; the API resolves prices from PostgreSQL. Shipping is INR 99 below INR 1,999 and free at/above that threshold. All orders are `MOCK_CONFIRMED`. No gateway is contacted. Invalid quantities, unknown products, duplicate product lines, unsupported payment methods and malformed addresses are rejected.

Run tests with `mvn test`. Configuration overrides: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `PORT`. See the root README for local database defaults and limitations.

## Admin API

Admin UI: `http://127.0.0.1:5173/admin`. Credentials are generated on first startup in `.local/admin-credentials.txt` and excluded from Git. Open the backend with this directory as the working directory so the credentials path stays consistent.

| Method     | Endpoint                       | Purpose                                  |
| ---------- | ------------------------------ | ---------------------------------------- |
| GET        | `/api/csrf`                    | Session-bound CSRF token and header name |
| POST       | `/api/admin/login`             | Form-encoded `username` / `password`     |
| POST       | `/api/admin/logout`            | End the admin session                    |
| GET        | `/api/admin/session`           | Current admin identity                   |
| GET        | `/api/admin/dashboard`         | Overview statistics                      |
| GET/POST   | `/api/admin/products`          | List all / create                        |
| PUT/DELETE | `/api/admin/products/{id}`     | Update / archive                         |
| GET/POST   | `/api/admin/categories`        | List / create                            |
| PUT/DELETE | `/api/admin/categories/{name}` | Rename/update / remove unused            |
| POST       | `/api/admin/media`             | Multipart JPEG/PNG upload (`file`)       |
| GET        | `/api/media/{uuid}`            | Public product image                     |
| GET        | `/api/admin/orders?page=0`     | Paginated orders, 50 per page            |
| GET/PATCH  | `/api/admin/orders/{id}`       | Details / fulfillment update             |

All mutation requests, including login, logout and customer checkout, require the session-bound CSRF token from `/api/csrf`. Fetch a new token after login/logout. Use the returned `headerName` and `token` with the same session cookie. The frontend handles this in `src/api.ts`. Admin endpoints require `SUPER_ADMIN`; no cross-origin CORS access is enabled.

Admin and customer data, including image bytes, share the same PostgreSQL database. New migration V2 adds admin accounts, categories, media, inventory and fulfillment without replacing V1 data.

## Formatting

```sh
mvn spotless:apply
mvn spotless:check
mvn verify
BLUSHAURA_INTEGRATION_TESTS=true mvn verify
```

Spotless uses Google Java Format and runs its check during `validate`. Integration tests require the local PostgreSQL service and roll back their test catalogue/order data.

Image uploads accept multipart `width` and `height` (200–2400 pixels, default 1200) and `scale` (25–100 percent, default 100). The backend fits the source inside the canvas without cropping, centres it, and fills unused and transparent areas with white before storing the resized image in PostgreSQL.

Cropping is optional: multipart `cropX`, `cropY`, `cropWidth`, `cropHeight` specify the selected source rectangle in pixels. Supply all four or none. The backend validates bounds, crops first, then fits the result onto the white output canvas. The admin UI calculates both crop coordinates and output dimensions automatically.
