# 16. Pricing / SaaS Business Model

Strategizing via a localized multi-tiered subscription model focused on the Costa Rican market, including a one-time onboarding fee to cover initial setup and personalized support.

**One-Time Installation & Setup Fee: ₡100,000 CRC (~$200 USD)**
- *Includes initial platform setup, menu data entry (up to a limit), and onboarding training for restaurant staff.*

- **Core / Basic Tier: ₡25,000 CRC / month (~$50 USD)**
  - Custom branded slug: `brandname.myplatform.com`.
  - Display digital menu (read-only listing).
  - Basic location and operating hours widget.
  - "Contact us" via prominent auto-dial WhatsApp redirection button.
- **Pro Tier: ₡40,000 CRC / month (~$80 USD)**
  - *Includes Basic tier features.*
  - Dynamic image uploads utilizing Supabase storage allocations.
  - Reservations system module empowering internal calendar views, email notifications, and basic workflow (Approval/Rejection).
  - Comprehensive styling toggles (Theme customization).
- **Premium Tier: ₡60,000 CRC / month (~$120 USD) + % Processing Transaction Fees**
  - Custom domain alignments (via CNAME pointing directly to the infrastructure proxy).
  - Full online ordering (Pickup / Local Delivery via Stripe integration checkout).
  - Deeper metric analytics and CSV exportation.

# 17. Development Roadmap

Build in this exact progressive order so the system scales correctly without getting lost:

1. Authentication (Users)
2. Restaurants module
3. User-Restaurant relationship (Many-to-Many via UserRestaurants)
4. Admin dashboard basic
5. Menu module
6. Public website template (Next.js Wildcard routing)
7. Slug routing (Dynamic tenant resolution)
8. Image upload (Supabase Storage)
9. Reservations
10. Subscriptions (Plans & Billing)
11. Subdomains (Wildcard DNS configuration)
12. Orders

# 18. Future Improvements

Beyond immediate roadmapping, extensive enterprise pathways include:
- Generating QR codes customized by tables (e.g., `slug.domain.com/menu?table=4`).
- Integrating with external aggregators (UberEats, DoorDash).
- Point-of-Sale (POS) API synchronization.
- Granular employee management including shift logs and permissions modeling.
- Native React Native Mobile application deployments utilizing existing APIs.

# 19. Maintenance and Support Model

SaaS survival is intrinsically linked to reliability tracking.
- Application error logging pipelined automatically into **Sentry**, trapping and alerting engineers immediately to frontend or backend failures.
- System logs funneled utilizing **Serilog** exported into log aggregator interfaces.
- Continuous platform evolution ensuring 99.9% uptime SLA commitments are upheld iteratively via DevOps practices.
- Front-line tenant support utilizing conversational models or direct integrations like Intercom / Zendesk installed statically onto admin interfaces ensuring seamless communication bridges with restaurant proprietors.
