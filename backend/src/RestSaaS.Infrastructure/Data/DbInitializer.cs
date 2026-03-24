using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.Entities;
using BCrypt.Net;
using System;
using System.Collections.Generic;
using System.Linq;

namespace RestSaaS.Infrastructure.Data;

public static class DbInitializer
{
    public static void Initialize(ApplicationDbContext context)
    {
        // Apply migrations
        // context.Database.Migrate();

        // Seed Restaurants
        if (!context.Restaurants.Any())
        {
            var initialRestaurants = new Restaurant[]
            {
                new Restaurant { Name = "Pizza Luna", Slug = "pizzaluna", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Restaurant { Name = "Sushi Time", Slug = "sushitime", IsActive = true, CreatedAt = DateTime.UtcNow }
            };

            context.Restaurants.AddRange(initialRestaurants);
            context.SaveChanges();

            // Add some initial menu for the first restaurant
            var firstRestaurant = initialRestaurants[0];
            var menu = new Menu { RestaurantId = firstRestaurant.Id, Name = "Main Menu", IsActive = true };
            context.Menus.Add(menu);
            context.SaveChanges();

            var category = new MenuCategory { RestaurantId = firstRestaurant.Id, MenuId = menu.Id, Name = "Pizzas", DisplayOrder = 1 };
            context.MenuCategories.Add(category);
            context.SaveChanges();

            var items = new MenuItem[]
            {
                new MenuItem { RestaurantId = firstRestaurant.Id, CategoryId = category.Id, Name = "Margherita", Description = "Fresh mozzarella, basil and tomato sauce", Price = 12.99m, IsAvailable = true },
                new MenuItem { RestaurantId = firstRestaurant.Id, CategoryId = category.Id, Name = "Pepperoni", Description = "Classic pepperoni with mozzarella", Price = 14.99m, IsAvailable = true }
            };

            context.MenuItems.AddRange(items);
            context.SaveChanges();
        }

        // 🚀 Seed Platform Admin (User's Example)
        if (!context.Users.Any(u => u.Email == "you@mail.com"))
        {
            context.Users.Add(new User
            {
                Email = "you@mail.com",
                Name = "Platform Master",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                PlatformRole = "PlatformAdmin"
            });
        }

        // 🚀 Seed Restaurant Owner & Staff (User's Example)
        var ownerUser = context.Users.FirstOrDefault(u => u.Email == "owner@pizza.com");
        if (ownerUser == null)
        {
            ownerUser = new User
            {
                Email = "owner@pizza.com",
                Name = "Pizza Owner",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Owner123!"),
                PlatformRole = "PlatformUser"
            };
            context.Users.Add(ownerUser);
        }

        var staffUser = context.Users.FirstOrDefault(u => u.Email == "staff@pizza.com");
        if (staffUser == null)
        {
            staffUser = new User
            {
                Email = "staff@pizza.com",
                Name = "Pizza Staff",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff123!"),
                PlatformRole = "PlatformUser"
            };
            context.Users.Add(staffUser);
        }
        context.SaveChanges();

        // 🍕 Seed Pizza Luna and Link Roles
        var pizzaLuna = context.Restaurants.FirstOrDefault(r => r.Slug == "pizzaluna");
        if (pizzaLuna != null)
        {
            pizzaLuna.OwnerUserId = ownerUser.Id;
            
            // Link Owner
            if (!context.UserRestaurants.Any(ur => ur.UserId == ownerUser.Id && ur.RestaurantId == pizzaLuna.Id))
            {
                context.UserRestaurants.Add(new UserRestaurant { UserId = ownerUser.Id, RestaurantId = pizzaLuna.Id, Role = "Owner" });
            }

            // Link Staff
            if (!context.UserRestaurants.Any(ur => ur.UserId == staffUser.Id && ur.RestaurantId == pizzaLuna.Id))
            {
                context.UserRestaurants.Add(new UserRestaurant { UserId = staffUser.Id, RestaurantId = pizzaLuna.Id, Role = "Staff" });
            }
        }
        context.SaveChanges();

        // Seed Legacy Admin User if not exists
        if (!context.Users.Any(u => u.Email == "admin@tablehive.com"))
        {
            var adminUser = new User
            {
                Email = "admin@tablehive.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                PlatformRole = "PlatformAdmin"
            };
            context.Users.Add(adminUser);
            context.SaveChanges();

            // Link Admin to existing restaurants
            var allRestaurants = context.Restaurants.ToList();
            foreach (var restaurant in allRestaurants)
            {
                if (!context.UserRestaurants.Any(ur => ur.UserId == adminUser.Id && ur.RestaurantId == restaurant.Id))
                {
                   context.UserRestaurants.Add(new UserRestaurant
                   {
                       UserId = adminUser.Id,
                       RestaurantId = restaurant.Id,
                       Role = "Owner"
                   });
                }
            }
            context.SaveChanges();
        }

        // 🎁 Seed Tiers (Phase 1.2.2/1.2.3 Refinement)
        var requiredPlans = new List<Plan>
        {
            new Plan { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Name = "Core / Basic", Price = 25000, Currency = "CRC", MaxMenuItems = 50, MaxUsers = 1, Features = "[\"Menú Digital\", \"QR Code\", \"WhatsApp Contact\"]" },
            new Plan { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Name = "Pro Tier", Price = 40000, Currency = "CRC", MaxMenuItems = 200, MaxUsers = 5, Features = "[\"Todo lo de Basic\", \"Imágenes\", \"Reservaciones\", \"Temas\"]" },
            new Plan { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Name = "Premium", Price = 60000, Currency = "CRC", MaxMenuItems = 1000, MaxUsers = 20, Features = "[\"Todo lo de Pro\", \"Dominio Propio\", \"Pedidos Online\", \"Analytics\", \"Soporte 24/7\"]" }
        };

        foreach (var p in requiredPlans)
        {
            var existing = context.Plans.FirstOrDefault(pl => pl.Id == p.Id || pl.Name == p.Name);
            if (existing == null)
            {
                context.Plans.Add(p);
            }
            else
            {
                // Update features and price (Phase 10 / 1.2.3 consistency)
                existing.Features = p.Features;
                existing.Price = p.Price;
                existing.IsActive = true;
                existing.MaxMenuItems = p.MaxMenuItems;
                existing.MaxUsers = p.MaxUsers;
            }
        }
        context.SaveChanges();

        // 🚀 Deactivate legacy plans (Phase 10 cleanup)
        var legacyNames = new[] { "Free", "Enterprise", "Pro" };
        var legacyPlans = context.Plans.Where(p => legacyNames.Contains(p.Name)).ToList();
        foreach (var lp in legacyPlans)
        {
            lp.IsActive = false;
        }
        context.SaveChanges();

        // 🚀 Auto-subscribe legacy restaurants
        var restaurantsToSubscribe = context.Restaurants.ToList();
        var defaultPlan = context.Plans.FirstOrDefault(p => p.Name == "Core / Basic") ?? context.Plans.FirstOrDefault();
        
        if (defaultPlan != null)
        {
            foreach (var restaurant in restaurantsToSubscribe)
            {
                if (!context.Subscriptions.Any(s => s.RestaurantId == restaurant.Id))
                {
                    context.Subscriptions.Add(new Subscription
                    {
                        RestaurantId = restaurant.Id,
                        PlanId = defaultPlan.Id,
                        StartDate = DateTime.UtcNow,
                        IsActive = true,
                        Status = "Active"
                    });
                }
            }
            context.SaveChanges();
        }
    }
}
