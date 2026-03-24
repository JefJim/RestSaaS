# Restaurant SaaS Platform – Architecture Design Document

## 1. Project Overview

The project consists of building a multi-tenant SaaS platform that allows multiple restaurants to create and manage their own website, digital menu, reservations, and future online ordering system from a single platform.

Each restaurant will have its own public page and admin panel, but all restaurants will run on the same backend, frontend, and database infrastructure using tenant isolation.

The platform will be scalable to support dozens or hundreds of restaurants.

---

## 2. Multi-Tenant Architecture Concept

The system will use a multi-tenant architecture where all restaurants share the same application but their data is isolated using a RestaurantId (TenantId) in the database.

### Multi-Tenant Strategy

Single Database
Shared Schema
Tenant Isolation via RestaurantId column in all business tables.

This means tables like:

* Menus
* MenuItems
* Reservations
* Orders
* Settings
* OpeningHours

Will all contain:
RestaurantId

This allows the system to support many restaurants with a single deployment.

---

## 3. High Level System Architecture

System components:

1. Frontend (Next.js public websites + admin panel)
2. Backend API (.NET Web API)
3. Database (PostgreSQL)
4. File Storage (S3 / Azure Blob)
5. Reverse Proxy (Nginx)
6. DNS + Wildcard Subdomains
7. Docker Environment
8. CI/CD Pipeline
9. Payment/Subscriptions (Stripe future)
10. Monitoring & Logging

### Architecture Flow

Client Browser → Nginx → Frontend → Backend API → Database
→ File Storage

---

## 4. Onboarding Flow (New Restaurant Registration)

The system onboarding flow will be:

1. User signs up with email and password
2. User creates a restaurant
3. User selects a subscription plan
4. System creates the restaurant tenant
5. System creates default menu and settings
6. System assigns subdomain or slug
7. User is redirected to Restaurant Admin Dashboard
8. User configures menu, images, hours, etc.

### Flow Summary

User → Restaurant → Subscription → Setup → Admin Panel

---

## 5. Database Core Entities

Main database entities required:

### Users

Stores platform users.

Fields:

* Id
* Email
* PasswordHash
* Name
* CreatedAt

### Restaurants

Tenant table.

Fields:

* Id
* Name
* Slug
* Subdomain
* OwnerUserId
* PlanId
* CreatedAt
* Active

### UserRestaurants

Relationship between users and restaurants.

Fields:

* UserId
* RestaurantId
* Role (Owner, Admin, Staff)

### Plans

Subscription plans.

Fields:

* Id
* Name
* Price
* MaxMenuItems
* MaxUsers
* Features

### Subscriptions

Restaurant subscription status.

Fields:

* Id
* RestaurantId
* PlanId
* StartDate
* EndDate
* Active

---

## 6. Restaurant Modules

Each restaurant will have its own modules:

* Menu
* Menu Categories
* Menu Items
* Reservations
* Orders (future)
* Opening Hours
* Settings
* Promotions
* Staff Users
* Reports (future)

All these tables must include RestaurantId.

---

## 7. Admin Panels

The system will have three main interfaces:

### Platform Admin Panel

Used by platform owner to:

* Create restaurants
* Manage plans
* Manage subscriptions
* View analytics
* Disable restaurants
* Manage users

### Restaurant Admin Panel

Used by restaurant owners to:

* Edit menu
* Upload images
* Manage reservations
* Manage orders
* Manage staff
* Edit website info
* Opening hours
* Promotions

### Public Restaurant Website

Used by customers to:

* View menu
* Make reservations
* Order food (future)
* View location
* Contact via WhatsApp

---

## 8. Subdomain / URL Routing Strategy

Restaurants will be accessed via:

Subdomain approach:
restaurantname.platform.com

Or slug approach:
platform.com/restaurantname

The system will store:

* Slug
* Subdomain
  In the Restaurants table.

A wildcard DNS entry will be configured:
*.platform.com

This allows unlimited subdomains without purchasing new domains.

---

## 9. Project Modules Structure

Recommended backend module structure:

/modules
/auth
/users
/restaurants
/subscriptions
/plans
/billing
/platform-admin
/menus
/menu-categories
/menu-items
/reservations
/orders
/opening-hours
/settings
/staff
/public-website

---

## 10. Development Order (Recommended)

To build the system correctly, development should follow this order:

1. Authentication (Users)
2. Restaurants Module
3. User-Restaurant Relationship
4. Restaurant Admin Dashboard Basic
5. Menu Module
6. Public Website Template
7. Slug Routing
8. Image Upload
9. Reservations
10. Subscriptions
11. Subdomains
12. Orders
13. Reports and Analytics
14. Mobile App (Future)

---

## 11. DevOps and Deployment Architecture

Infrastructure should include:

* Docker
* docker-compose
* Reverse proxy (Nginx)
* Wildcard subdomain routing
* CI/CD pipeline
* Automated deployment
* Database backups
* Logging
* Monitoring

Deployment Flow:
Git Push → CI/CD → Build Docker → Deploy → Restart Containers

---

## 12. Future Platform Features

Future improvements for the SaaS platform:

* Online ordering
* Payment gateway
* Delivery zones
* Analytics dashboard
* Inventory management
* Employee management
* Loyalty program
* Email marketing
* Custom domains per restaurant
* Mobile application
* Multi-language support

---

## 13. Business Model

The platform will operate as SaaS with:

* Monthly subscription per restaurant
* Setup fee optional
* Maintenance included in subscription
* Premium features in higher plans
* Optional custom development services
* Optional revenue percentage for online ordering

---

## 14. Final System Concept

Platform Flow:

Restaurant registers → Platform creates tenant →
Restaurant configures website → Customers visit website →
Customers view menu / reserve / order → Restaurant manages from admin panel.

This platform is designed to scale from a few restaurants to hundreds using a single system.
