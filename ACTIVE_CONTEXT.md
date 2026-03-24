# Active Context: Multi-Tenant Restaurant SaaS Platform

## Project Overview
A multi-tenant SaaS platform for restaurants, enabling them to have dedicated websites, digital menus, and reservation systems. Built to scale to 100+ restaurants.

## Tech Stack
- **Frontend**: Next.js 15 (React 19), Tailwind CSS v4, TypeScript
- **Backend**: .NET 9 Web API, Entity Framework Core
- **Database**: PostgreSQL (Multi-tenant via EF Core Global Query Filters)
- **Infrastructure**: Docker Compose, Nginx (local tenant routing)

## Current Architecture
- Uses subdomain-based tenant resolution (e.g., `pizzaluna.myplatform.localhost`).
- Nginx intercepts wildcard subdomains and forwards to the Next.js frontend or .NET API.
- The platform uses a single database, isolating data per restaurant via `RestaurantId`.

## Current State & Recent Fixes
- **Docker Setup**: The Docker Daemon and `docker-compose` environment are fully working. Missing Dockerfiles for the Next.js frontend and .NET backend were created. 
- **Frontend Build**: Fixed Next.js build requirement for Node.js 18.18.0+ by using `node:20-alpine` in the Dockerfile.
- **Backend Clean Architecture**: Implemented `DbInitializer` and correctly wired ApplicationDbContext via Dependency Injection. The backend seeds a fictitious restaurant ("Pizza Luna") automatically.
- **Frontend UI / Clean Architecture**: Implemented a highly premium Tailwind CSS v4 UI (glassmorphism, animations). Introduced feature-based clean architecture (e.g., `src/features/auth`, `src/components/ui`).

## Database & Infrastructure
- **Remote Supabase Integration**: Migrated off local Postgres to a live cloud Supabase database containerized properly with `.env` connection strings.
- **Entity Framework Core Migrations**: `InitialCreate` migration successfully synchronized and `.NET` backend is live feeding Next.js via `/api/stats`.

## Branding & Localization
- **App Name**: TableHive (`logo.png` active globally).
- **Localization**: UI completely translated to Spanish (Costa Rica).
- **Legal Compliance**: Active Costa Rica Terms of Service and Privacy Policy (`Ley 8968 PROHABDAT`).

## Development Order (Roadmap)
1. [x] **Authentication (Users)**: Fully decoupled schema with Supabase, dynamic AuthController JWT logic.
2. [x] **Restaurants module**: Built GET/PUT endpoints and generic data interfaces.
3. [x] **User-Restaurant relationship**: Migrated schema creating `UserRestaurants` junction mappings via EF Core.
4. [x] **Admin dashboard basic**: Developed Next.js Sidebar layout and data-fetching Widgets.
5. [x] **Menu module**: Built full CRUD for Categories and Items with dynamic frontend management.
6. [x] **Public website template** (Next.js Wildcard routing) - COMPLETED: Dynamic public pages with real API data, menu display, and reservation forms.
7. [x] **Slug routing** (Dynamic tenant resolution) - COMPLETED: Enhanced middleware for robust subdomain/slug routing with validation and production support.
8. [x] **Image upload** (Supabase Storage) - COMPLETED: Integrated Supabase Storage with file upload service, image management UI, and secure upload endpoints.
9. [ ] **Reservations**
10. [ ] **Subscriptions** (Plans & Billing)
11. [ ] **Subdomains** (Wildcard DNS configuration)
12. [ ] **Orders**
