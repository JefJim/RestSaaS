# 1. Project Overview

The proposed project is a comprehensive multi-tenant SaaS platform empowering restaurants to easily launch and manage their digital presence. Using a single infrastructure, the platform provides distinct capabilities for multiple restaurants:
- An individualized public website (via subdomains/slugs like `pizzaluna.myplatform.com`)
- Digital menus with categories and item imagery
- A reservation booking system
- A restaurant admin panel for content and menu management
- A platform super-admin dashboard for user and subscription lifecycle management

By centralizing the deployment and abstracting the complexity of scaling, it brings down the operational costs for restaurant owners and allows the platform operators to easily scale horizontally to support hundreds of restaurants simultaneously.

# 2. System Architecture

The architecture is explicitly designed for a multi-tenant cloud environment, separating the application vertically into logical tiers:

- **Frontend Tier**: Built with Next.js (React), favoring Server-Side Rendering (SSR) and Static Site Generation (SSG) for high performance and excellent SEO (critical for restaurant presence online).
- **Backend Tier**: A robust .NET Web API exposing RESTful endpoints. It securely brokers transactions to the database and integrates with external services.
- **Data Tier**: PostgreSQL instance serving as the unified datastore, accessed via Entity Framework (EF) Core with tenant-isolation filters configuration.
- **Authentication**: JWT (JSON Web Tokens) acting statelessly to authenticate users, administrators, and tenant context across micro-services.
- **Object Storage**: Supabase Storage utilized for storing, optimizing, and delivering static assets like meal images, avatars, or logos.
- **Network / CDN**: Cloudflare manages DNS routing, CDN caching, wildcard SSL certificates, and DDoS protection, tunneling traffic to an Nginx reverse proxy or Load Balancer.
- **External Dependencies**:
  - *Stripe*: Subscription billing, checkout, and webhook management.
  - *SendGrid*: Delivery of transactional emails for account setups, password resets, and reservation confirmations.

# 3. Multi-Tenant Architecture Explanation

At the core of the SaaS, a **Shared Application, Shared Database** architectural model is maintained. This ensures operational simplicity, lower infra costs, and easier schema migrations in a startup phase.

**Tenant Resolution & Data Isolation Strategy:**
- **Routing Isolation**: The frontend identifies the active tenant via the hostname proxy header. The Next.js middleware extracts the subdomain (`slug`) and dynamically serves the corresponding restaurant's data via rewrite rules.
- **Data Isolation**: On the database level, almost all tables possess a `RestaurantId` foreign key. EF Core utilizes **Global Query Filters** (e.g., `modelBuilder.Entity<Menu>().HasQueryFilter(m => m.RestaurantId == currentTenantId)`). When a request operates, a scoped `ITenantService` deduces the current `RestaurantId` (from the access token or domain context header), enforcing absolute data isolation invisibly downstream to ensure one restaurant cannot access another's private data.

# 4. Access Control and Roles
You should implement roles from the beginning to support scalable multi-tenancy:
- **PlatformAdmin**: Manage all restaurants across the SaaS.
- **RestaurantOwner**: Billing, users.
- **RestaurantAdmin**: Menu, reservations.
- **Staff**: Orders, reservations.

# 5. Dashboard Ecosystem
Your system will contain 3 distinct dashboards/views:
1. **Platform Admin Dashboard**: For the SaaS owner (Create restaurants, Manage plans, View subscriptions, Disable restaurants, Analytics).
2. **Restaurant Admin Dashboard**: For restaurant owner (Edit menu, Upload images, Manage reservations, Manage orders, Manage staff).
3. **Public Website**: For customers (View menu, Make reservation, Order food).

# 6. Subdomain Creation Flow
When a restaurant is created:
**Restaurant Name → Generate Slug → Build URL → `pizzaluna.yourplatform.com` → Save in database.**
*Note*: You DO NOT create DNS routing every time. A wildcard `*.yourplatform.com` DNS record handles all incoming traffic, and Next.js dynamically identifies the tenant payload via the slug.
