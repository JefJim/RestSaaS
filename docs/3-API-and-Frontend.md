# 5. API Structure

The .NET Web API is segmented by domains, observing RESTful conventions. Endpoints requiring an active tenant assert it through a custom authorization policy.

- **`AuthController`**: Handles login, password resets, and JWT issuance.
- **`TenantController`**: Public resolution of tenant configurations from domain slugs (fetching theme configs without auth).
- **`PlatformAdminController`**: Restricted to root admins. Management of tenant accounts and overarching subscription structures.
- **`MenuController`**: Tenant-scoped. CRUD for menus and categories (e.g., `GET /api/menu`, `POST /api/menu/{id}/items`).
- **`ReservationController`**: Tenant-scoped processing.
- **`SubscriptionController`**: Webhook endpoints intended securely for Stripe backend events parsing.

# 6. Frontend Structure

Developed natively via the Next.js App Router paradigm, cleanly severing internal applications based on path conventions.

- **`/app/(public)/[tenantSlug]/`**: Public facing dynamically generated directories.
  - `/page.tsx`: Landing, Hero, Location.
  - `/menu/page.tsx`: Product listings.
  - `/reservations/page.tsx`: Embedded or custom date-picking workflows.
- **`/app/admin/`**: Secured SPA for restaurant staff.
  - `/menu-editor/`: Drag and drop categorical organizers.
  - `/reservations/`: Calendar perspectives of inbound guests.
  - `/settings/`: Updating hours, location, WhatsApp details.
- **`/app/platform/`**: High-level platform administration dashboard for internal SaaS operators overviewing onboarding counts, active sessions, and revenue.

# 7. Authentication Flow

1. The client executes `POST /api/auth/login` containing identity traits.
2. The .NET API validates, mapping to the `Users` table, reading `Role` and `RestaurantId`.
3. The API encodes these claims inside a signed JWT and returns it or sets it as an `HttpOnly` cookie.
4. On requests modifying protected resources, the token acts as the gatekeeper.
5. In `.NET`, middleware unwraps the token. Its `RestaurantId` dynamically scopes Entity Framework operations through Global Filters, inherently prohibiting cross-tenant data edits.

# 8. Subdomain Routing Explanation

Supporting `pizzaluna.myplatform.com` is architected via the edge and application components cooperating seamlessly:
1. **Cloudflare** defines a wildcard `*.myplatform.com` A-record proxying toward the host infrastructure. It handles SNI validation automatically.
2. An **Nginx Reverse Proxy** or Cloud Ingress (Azure Application Gateway) forwards traffic intact, maintaining the original HTTP `Host` header.
3. The Next.js native `middleware.ts` scrutinizes `request.headers.get("host")`.
4. It isolates the first node (e.g., `pizzaluna`). If `pizzaluna` aligns natively with `www` or static apps like `admin`, or `platform`, it routes accordingly.
5. If identified as a distinct tenant, Next.js implements an internal rewrite using `NextResponse.rewrite()`, mapping `pizzaluna.myplatform.com/menu` silently onto `/[tenantSlug]/menu`. The end-user never observes the rewrite, ensuring professional branding.
