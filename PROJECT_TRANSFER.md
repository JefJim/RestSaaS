# RestSaaS Project Transfer & Logic Manual

This document captures the current state, architectural logic, and pending roadmap for the RestSaaS (TableHive) platform. Use this as the primary context when resuming development in a new environment.

## 🔗 Repository & Branch
- **Remote**: `https://github.com/JefJim/RestSaaS.git`
- **Active Branch**: `development`
- **Main Branch**: Empty (Reserved for production releases).

## 🏗️ Core Architecture (Multi-Tenancy)
The system uses a **Shared Database, Shared Application** model with strict tenant isolation.

### 1. Decoupled Identity Logic
- **Users** are now detached from **Restaurants**.
- A junction table `UserRestaurants` manages the many-to-many relationship.
- **Why**: Allows one user (Owner) to manage multiple restaurants and allows for Staff/Admin roles per restaurant.

### 2. Tenant Resolution (The "Magic" Middleware)
- **Backend (.NET)**: `TenantResolutionMiddleware` intercepts every request.
- It extracts the `RestaurantId` claim from the JWT token.
- It injects the ID into `ITenantService`, which `ApplicationDbContext` uses in a **Global Query Filter**.
- **Result**: You simply query `_context.Menus.ToList()` and EF Core automatically appends `WHERE RestaurantId = '...'`.

### 3. Auth Flow
- **Registration**: Creates a `User`, a `Restaurant`, and links them in `UserRestaurants` with the role `RestaurantOwner`.
- **Encryption**: BCrypt is used for passwords.
- **JWT**: Issued on login/register, contains `UserId`, `Email`, `Role`, and `RestaurantId`.

## 🛠️ Tech Stack & Environment
- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, Lucide Icons.
- **Backend**: .NET 9 Web API, Entity Framework Core.
- **Database**: Supabase (PostgreSQL).
- **Orchestration**: Docker Compose.

### Environment Variables (.env)
Located in `infrastructure/docker/.env`:
```bash
DB_CONNECTION_STRING="User Id=postgres.khewkwdcdneklzrmmkor;Password=aS4~4.9b>/fz;Server=aws-1-us-east-2.pooler.supabase.com;Port=5432;Database=postgres"
JWT_SECRET="SuperSecretKeyForDevelopmentAndTestingOnly!123"
```

## 📈 Roadmap Progress
- [x] **Phase 1: Auth**: JWT + BCrypt + Registration Flow.
- [x] **Phase 2: Restaurants**: CRUD for Tenant profiles.
- [x] **Phase 3: Relationships**: Many-to-Many logic.
- [x] **Phase 4: Basic Dashboard**: Sidebar + Protected Routes + Stats.
- [x] **Phase 5: Menu Module**: Category & Item management backend + UI.
- [x] **Phase 10: Subscriptions**: Integrated Plan/Subscription entities and pricing UI.
- [ ] **Phase 11 (Next): Subdomains**: Wildcard DNS and Nginx optimization.

## 🚀 How to Run
1. `cd infrastructure/docker`
2. `docker compose up --build -d`
3. Frontend: `cd frontend && npm run dev` (Port 3000)
4. Backend API: Accessible at `http://localhost:8080`

## 📂 Critical Logic Files
- **Backend**:
  - `Program.cs`: JWT configuration and Middleware pipeline.
  - `ApplicationDbContext.cs`: Global Query Filters logic.
  - `TenantResolutionMiddleware.cs`: Current tenant extraction.
  - `AuthController.cs`: Registration Orchestration.
- **Frontend**:
  - `src/features/auth`: Login/Signup API hooks.
  - `src/app/admin/dashboard/layout.tsx`: Protected route logic (JWT check).
  - `src/features/menu/components/MenuManager.tsx`: Complex state management for menu items.

## 📝 Localization
- **Language**: Spanish (Costa Rica).
- **Legals**: TOS and Privacy Policy aligned with `Ley 8968`.
