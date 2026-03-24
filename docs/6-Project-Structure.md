# Project Directory Overview

Structuring code purposefully for multi-tenancy ensures isolation of concerns, testability, and clarity. Below represents the recommended high-level folder scaffolding matching the defined tech stack.

```text
/RestSaaS
├── /frontend                        # Next.js Application Core
│   ├── /src                         
│   │   ├── /app                     # Next.js App Router root
│   │   │   ├── /(public)            # Grouped route: Public views
│   │   │   │   └── /[tenantSlug]    # Subdomain catch-all architecture
│   │   │   │       ├── /menu      
│   │   │   │       └── /reservations
│   │   │   ├── /admin               # Restaurant Admin Pannel SPA
│   │   │   └── /platform            # Super Admin Global Operations SPA
│   │   ├── /components              # Shared isolated React pieces
│   │   │   ├── /ui                  # Design system (Buttons, Cards)
│   │   │   └── /tenant              # Multitenant specific visuals
│   │   ├── /hooks                   # Custom React utility hooks
│   │   ├── /lib                     # Utilities, logic, API clients bindings
│   │   ├── /types                   # Global Typescript interfaces
│   │   └── middleware.ts            # Nginx Host -> Slug routing logic!
│   ├── next.config.mjs
│   ├── package.json
│   └── Dockerfile
│
├── /backend                         # .NET Web API
│   ├── RestSaaS.sln                 # Root solution mapping
│   ├── /src
│   │   ├── /RestSaaS.Api            # Presentation Layer
│   │   │   ├── /Controllers         # Route definitions and REST binding
│   │   │   ├── /Middleware          # Auth, Tenant injection workflows
│   │   │   └── Program.cs
│   │   ├── /RestSaaS.Core           # Domain Architecture
│   │   │   ├── /Entities            # DB Models (Restaurants, Menus...)
│   │   │   ├── /Interfaces          # Repositories & Services abstractions
│   │   │   ├── /Enums               # Global static enumerations
│   │   │   └── /Exceptions          # Custom domain-centric exceptions
│   │   ├── /RestSaaS.Infrastructure # Data Layer / 3rd Party Wrappers
│   │   │   ├── /Data                # ApplicationDbContext, EF Core Migrations
│   │   │   ├── /Services            # StripeService, EmailService implementations
│   │   │   └── /Tenancy             # Tenant Resolution Logic providers
│   ├── /tests
│   │   ├── /RestSaaS.UnitTests
│   │   └── /RestSaaS.IntegrationTests
│   └── Dockerfile
│
├── /infrastructure                  # Dev Ops / CI-CD definitions
│   ├── /docker                      # Compose / local runtime bindings
│   │   ├── docker-compose.yml 
│   │   └── /nginx            
│   │       └── nginx.conf           # Local wildcard URL simulations
│   └── /.github                     
│       └── /workflows              
│           └── ci-cd.yml            # Main automated action runner
│
├── /database                        # SQL definitions aside from EF Core
│   ├── init.sql                     # Base tables for non-EF managed objects or DB creates
│   └── seed_data.sql                # Preload configuration platforms
│
└── /docs                            # System Documentations
    ├── 1-Architecture.md
    ├── 2-Database-Schema.md
    ├── 3-API-and-Frontend.md
    ├── 4-DevOps-Deploy.md
    ├── 5-Business-Roadmap.md
    └── 6-Project-Structure.md
```
