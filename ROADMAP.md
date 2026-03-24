# TableHive Master Roadmap (Master Manual) 🐝

This roadmap defines the **Logic & Intention** of each phase to guide precise debugging and verification. Use this as your primary reference for the platform's lifecycle.

---

### Phase 1: Authentication (Users)
- **User Story**: "As a platform user, I want to create a secure account with my email/password."
- **Intention**: Build a secure entry point. Decouple User identity from business data.
- **Status**: ✅ Complete

### Phase 1.1: Google OAuth
- **User Story**: "As a final user, I want to log in with Google for a frictionless experience."
- **Intention**: Accelerate onboarding and increase conversion. Links social IDs to existing users.
- **Status**: ✅ Complete

### Phase 2: Restaurants Module
- **User Story**: "As an owner, I want to define my brand name and slug (e.g., Pizza Luna)."
- **Intention**: Create the "Tenant" entity. All future data is isolated by this ID.
- **Status**: ✅ Complete

### Phase 3: User-Restaurant Relationship
- **User Story**: "As an owner, I want to manage my restaurant and potentially add staff."
- **Intention**: Many-to-many logic. Allows one user to own/staff multiple locations.
- **Status**: ✅ Complete

### Phase 4: Admin Dashboard Basic
- **User Story**: "As an admin, I want a professional headquarters to manage my operations."
- **Intention**: Establish the private layout, sidebar, and core state management.
- **Status**: ✅ Complete

### Phase 5: Menu Module
- **User Story**: "As a chef, I want to categorize my dishes and set their prices/availability."
- **Intention**: Create the core product. Includes category hierarchy and item logic.
- **Status**: ✅ Complete

### Phase 6: Public Website Template
- **User Story**: "As a customer, I want to browse a high-performance menu on my phone."
- **Intention**: The "Product Delivery". High-speed, SEO-friendly public pages.
- **Status**: ✅ Complete

### Phase 7: Slug Routing (Local)
- **User Story**: "As a customer, I want to visit `platform.com/pizzaluna` easily."
- **Intention**: Connect URL paths to Tenant IDs dynamically using Middleware.
- **Status**: ✅ Complete

### Phase 8: Image Upload (Supabase)
- **User Story**: "As an admin, I want to show photos of my food to entice customers."
- **Intention**: S3-compatible storage integration for visual branding and scalability.
- **Status**: ✅ Complete

### Phase 9: Reservations
- **User Story**: "As a customer, I want to book a table for tomorrow at 8:00 PM."
- **Intention**: Transactional scheduling logic with multi-tenant isolation.
- **Status**: ✅ Complete

### Phase 10: Subscriptions (Monetization)
- **User Story**: "As an owner, I want to choose a plan that suits my business size."
- **Intention**: Data model for tiered features. Ready for Stripe integration.
- **Status**: ✅ Complete

### Phase 11: Subdomains (Wildcard)
- **User Story**: "As a brand, I want `pizzaluna.localhost` for a premium feel."
- **Intention**: Professional routing using wildcard DNS and Nginx. Avoids path collisions.
- **Status**: ✅ Complete

### Phase 12: Online Orders (Transactional)
- **User Story**: "As a customer, I want to buy my meal online and get a receipt."
- **Intention**: Full checkout flow, transactional data integrity, and staff order tracking.
- **Status**: 🛠️ In Progress (**NEXT STEP: Refine real-time updates**)

### Phase 13: Reports & Analytics (Governance)
- **User Story**: "As a platform owner, I want to see total revenue across all 100+ restaurants."
- **Intention**: Centralized governance and scaling insights.
- **Status**: ⏳ Planned
