# 4. Database Schema

The unified PostgreSQL database employs relational links to enforce multi-tenancy. Every core entity inherently references the `Restaurants` table to segment records.

## Core Entities

### High-Level Administrative
- **`Restaurants`**
  - `Id` (UUID, PK)
  - `Name` (VARCHAR)
  - `Slug` (VARCHAR, UNIQUE) — Used for URL subdomains (e.g. `sushitime`).
  - `PlanId` (UUID, FK)
  - `IsActive` (BOOLEAN)
  - `CreatedAt` (TIMESTAMP)

- **`Users`**
  - `Id` (UUID, PK)
  - `Email` (VARCHAR, UNIQUE)
  - `PasswordHash` (VARCHAR)
  - `Role` (VARCHAR) — Enum: 'PlatformAdmin', 'RestaurantOwner', 'RestaurantAdmin', 'Staff'.

- **`UserRestaurants` (Junction Table)**
  - `UserId` (UUID, FK)
  - `RestaurantId` (UUID, FK)
  - `AssignedRole` (VARCHAR) - Contextual role for this specific restaurant.

### Billing & Monetization
- **`Plans`**
  - `Id` (UUID, PK)
  - `Name` (VARCHAR)
  - `Price` (DECIMAL)
  - `Features` (JSONB)

- **`Subscriptions`**
  - `Id` (UUID, PK)
  - `RestaurantId` (UUID, FK)
  - `PlanId` (UUID, FK)
  - `StripeSubscriptionId` (VARCHAR)
  - `Status` (VARCHAR)
  - `ValidUntil` (TIMESTAMP)

### Core Business Output
- **`Menus`**
  - `Id` (UUID, PK)
  - `RestaurantId` (UUID, FK)
  - `Name` (VARCHAR)
  - `IsActive` (BOOLEAN)

- **`MenuCategories`**
  - `Id` (UUID, PK)
  - `RestaurantId` (UUID, FK)
  - `MenuId` (UUID, FK)
  - `Name` (VARCHAR)
  - `DisplayOrder` (INT)

- **`MenuItems`**
  - `Id` (UUID, PK)
  - `RestaurantId` (UUID, FK)
  - `CategoryId` (UUID, FK)
  - `Name` (VARCHAR)
  - `Description` (TEXT)
  - `Price` (DECIMAL)
  - `ImageUrl` (VARCHAR)
  - `IsAvailable` (BOOLEAN)

### Operations
- **`Reservations`**
  - `Id` (UUID, PK)
  - `RestaurantId` (UUID, FK)
  - `CustomerName` (VARCHAR)
  - `CustomerPhone` (VARCHAR)
  - `CustomerEmail` (VARCHAR)
  - `PartySize` (INT)
  - `ReservationTime` (TIMESTAMP)
  - `Status` (VARCHAR) — Enum: 'Pending', 'Confirmed', 'Cancelled', 'Completed'.

- **`Settings`**
  - `Id` (UUID, PK)
  - `RestaurantId` (UUID, FK)
  - `ContactEmail` (VARCHAR)
  - `ContactPhone` (VARCHAR)
  - `WhatsAppNumber` (VARCHAR)
  - `Address` (VARCHAR)
  - `ThemeConfig` (JSONB) — Colors, typography, toggle configurations.

- **`OpeningHours`**
  - `Id` (UUID, PK)
  - `RestaurantId` (UUID, FK)
  - `DayOfWeek` (INT)
  - `OpenTime` (TIME)
  - `CloseTime` (TIME)

- **`Promotions`**
  - `Id` (UUID, PK)
  - `RestaurantId` (UUID, FK)
  - `Code` (VARCHAR)
  - `DiscountType` (VARCHAR)
  - `DiscountValue` (DECIMAL)

*Future schemas like `Orders`, `DeliveryZones`, and `LoyaltyPoints` will fundamentally follow this same pattern.*
