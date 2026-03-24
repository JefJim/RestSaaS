# 9. Deployment Architecture

Deploying robust multi-tenant services mandates a scalable and decoupled environment.
- **Traffic Interception**: Cloudflare functions as the universal edge, mitigating immediate traffic spikes.
- **Reverse Proxy**: Nginx container acts as the immediate gateway on the host system to correctly interpret and channel traffic to backend/frontend upstream blocks, handling SSL termination optionally if not managed completely upstream via Azure AppGW.
- **Host Provider**: Azure natively supports this composition using Managed Azure Container Apps or Dockerized Azure Web Apps.
- **Stateless Deployments**: Frontend Next.js blocks and Backend .NET APIs run as Docker Swarm replicas or Kubernetes pods, dynamically expanding horizontally depending on load.
- **State Processing**: Azure Database for PostgreSQL (Flexible Server) handles data securely with HA configurations, while Supabase handles external object persistence.

# 10. Docker Setup

Local environment mirroring production guarantees velocity and reliability. Leveraging `docker-compose.yml`.

- **`frontend` service**: Built from a NodeJS alpine image. Exposes port 3000.
- **`backend` service**: Built from a `.NET 8` SDK/runtime image.
- **`database` service**: Uses standard `postgres:latest` image. Seeds via initiation SQL dumps or EF core migrations container.
- **`nginx` service**: Loads `/docker/nginx.conf` routing configuration to unify access locally over `.localhost` simulation.

# 11. CI/CD Pipeline

Using GitHub Actions to establish continuous confidence:
- **Build / Test**: On Pull Request to `main`, linting rules pass, `.NET` tests pass, and React unittests execute.
- **Bake**: Docker images are built sequentially passing platform variables.
- **Publish**: Images are securely pushed to Azure Container Registry (ACR).
- **Rollout**: Az CLI executes `containerapp update` to elegantly swap instances via blue/green deployment schemas or rolling upgrades, preventing system downtime.

# 12. Environment Variables

A strict `.env` strategy secures credentials and abstracts locations:
```env
# Database
POSTGRES_CONNECTION_STRING=User ID=postgres;Password=mypassword;Host=...;Database=restsaas;

# API Settings
JWT_SECRET=super_secret_cryptographic_signing_key_here
JWT_ISSUER=my_platform_identity
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://abc.supabase.co
SUPABASE_KEY=ey...

# Frontend 
NEXT_PUBLIC_BASE_URL=https://myplatform.com
NEXT_PUBLIC_API_URL=https://api.myplatform.com
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
```

# 13. Scaling Strategy

As parallel restaurant numbers explode:
- **Compute**: Stateless Docker containers auto-scale CPU based on utilization metrics. 
- **Database**: Add connection pooling (`PgBouncer`) intercepting thousands of DB handshakes to lower overhead.
- **Assets**: Transition heavily dynamic menus to Next.js Incremental Static Regeneration (ISR) with Edge caching to nullify DB hits upon standard public reads.

# 14. Security Considerations

- **Tenant Isolation Boundaries**: Strict logical separation through Global EF Core Queries mitigates accidental DB leakage.
- **Roles Matrix**: JWT attributes are stringently checked against route requirements preventing Staff traversing to Admin features.
- **Data Hardening**: Sensitive user configurations (like external integration secrets) mandate database-level encryption logic beyond passive rest encryption.

# 15. Backup and Disaster Recovery

- Automated asynchronous streaming backups running in Azure PostgreSQL up to 35-days Point In Time Recovery (PITR).
- Critical storage buckets (Supabase) redundantly mapped across geological bounds.
- Disaster recovery playbooks tested bi-quarterly executing full restorations from zeroed environments using Infrastructure as Code (Terraform/Bicep).
