# Multi-Tenant Restaurant SaaS Platform

Welcome to the central repository for the Multi-Tenant SaaS Platform, designed to host comprehensive online presence, digital menus, and reservation systems for restaurants at scale.

## Architecture

- **Frontend**: Next.js (TypeScript, Tailwind CSS, App Router)
- **Backend / API**: .NET 9 Web API (C#, Entity Framework Core)
- **Database**: PostgreSQL (Multi-tenant via EF Core Global Query Filters)
- **Infrastructure**: Docker, Nginx (Local tenant routing)

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (For spinning up Postgres, Nginx, and the full stack)
- [.NET 9 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/9.0) (If developing the backend)
- [Node.js v18+](https://nodejs.org/en) (If developing the frontend)

## 🏗️ Local Development Setup

To fully test wildcard subdomain routing locally (e.g., `pizzaluna.myplatform.localhost`), ensure you map your local DNS. Nginx expects to catch requests for `*.myplatform.localhost`.

**1. Update your Hosts file (Windows)**
Open Notepad as *Administrator* and edit `C:\Windows\System32\drivers\etc\hosts`. Append these lines to the bottom:
```text
127.0.0.1  myplatform.localhost
127.0.0.1  pizzaluna.myplatform.localhost
127.0.0.1  sushitime.myplatform.localhost
```
*(Add a new entry for whichever custom tenant slugs you want to test)*

---

### Option A: Run Everything via Docker Compose (Recommended)

This command mounts the database, runs the .NET API, boots the Next.js frontend, and layers the Nginx reverse proxy exactly as it would function in production.

1. Navigate to the docker infrastructure directory:
   ```bash
   cd infrastructure/docker
   ```
2. Build and start the containers in the background:
   ```bash
   docker-compose up --build -d
   ```
*(Nginx listens on port `80`, intercepting the subdomain host headers before they reach Next.js!)*

---

### Option B: Run Services Manually (For Active Code Development)

If you are changing the React interface or compiling C# classes, you want hot-reloading. 

**1. Start the Database & Nginx only (Skip backend/frontend Docker images)**
```bash
cd infrastructure/docker
docker-compose up db nginx -d
```

**2. Start the Backend API (.NET)**
```bash
cd backend/src/RestSaaS.Api
dotnet restore
dotnet run
```
*(The API will default to listening on `http://localhost:8080`)*

**3. Start the Frontend UI (Next.js)**
```bash
cd frontend
npm install
npm run dev
```
*(The UI will default to listening on `http://localhost:3000`)*

---

## 🧪 Testing the Platform

Once the web servers are running, access the portals visually from your browser:

- **Platform Root / Corporate Site**: [http://myplatform.localhost](http://myplatform.localhost)
- **Restaurant Tenant (Pizza Luna)**: [http://pizzaluna.myplatform.localhost](http://pizzaluna.myplatform.localhost)
- **Restaurant Menu Landing**: [http://pizzaluna.myplatform.localhost/menu](http://pizzaluna.myplatform.localhost/menu)
- **Tenant Admin Dashboard**: [http://myplatform.localhost/admin](http://myplatform.localhost/admin) or [http://pizzaluna.myplatform.localhost/admin](http://pizzaluna.myplatform.localhost/admin)

## 🗄️ Database Migrations
Before performing CRUD operations after changing the EF Core `ApplicationDbContext.cs`, you must generate and execute the database layout into PostgreSQL.

```bash
cd backend/src/RestSaaS.Api
dotnet ef migrations add InitialCreate --project ../RestSaaS.Infrastructure
dotnet ef database update
```
