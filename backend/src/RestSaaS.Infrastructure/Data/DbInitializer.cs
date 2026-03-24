using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.Entities;
using BCrypt.Net;

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
            var restaurants = new Restaurant[]
            {
                new Restaurant { Name = "Pizza Luna", Slug = "pizzaluna", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Restaurant { Name = "Sushi Time", Slug = "sushitime", IsActive = true, CreatedAt = DateTime.UtcNow }
            };

            context.Restaurants.AddRange(restaurants);
            context.SaveChanges();

            // Add some initial menu for the first restaurant
            var pizzaLuna = restaurants[0];
            var menu = new Menu { RestaurantId = pizzaLuna.Id, Name = "Main Menu", IsActive = true };
            context.Menus.Add(menu);
            context.SaveChanges();

            var category = new MenuCategory { RestaurantId = pizzaLuna.Id, MenuId = menu.Id, Name = "Pizzas", DisplayOrder = 1 };
            context.MenuCategories.Add(category);
            context.SaveChanges();

            var items = new MenuItem[]
            {
                new MenuItem { RestaurantId = pizzaLuna.Id, CategoryId = category.Id, Name = "Margherita", Description = "Fresh mozzarella, basil and tomato sauce", Price = 12.99m, IsAvailable = true },
                new MenuItem { RestaurantId = pizzaLuna.Id, CategoryId = category.Id, Name = "Pepperoni", Description = "Classic pepperoni with mozzarella", Price = 14.99m, IsAvailable = true }
            };

            context.MenuItems.AddRange(items);
            context.SaveChanges();
        }

        // Seed Admin User if not exists
        if (!context.Users.Any(u => u.Email == "admin@tablehive.com"))
        {
            var adminUser = new User
            {
                Email = "admin@tablehive.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Role = "PlatformAdmin"
            };
            context.Users.Add(adminUser);
            context.SaveChanges();

            // Link Admin to existing restaurants
            var restaurants = context.Restaurants.ToList();
            foreach (var restaurant in restaurants)
            {
                context.UserRestaurants.Add(new UserRestaurant
                {
                    UserId = adminUser.Id,
                    RestaurantId = restaurant.Id,
                    AssignedRole = "RestaurantOwner"
                });
            }
            context.SaveChanges();
        }

        // Seed Plans
        if (!context.Plans.Any())
        {
            var plans = new Plan[]
            {
                new Plan { Name = "Free", Price = 0, MaxMenuItems = 10, MaxUsers = 1, Features = "[\"Menú Digital\", \"QR Code\"]" },
                new Plan { Name = "Pro", Price = 29, MaxMenuItems = 100, MaxUsers = 5, Features = "[\"Menú Digital\", \"QR Code\", \"Reservaciones\", \"Soporte Chat\"]" },
                new Plan { Name = "Enterprise", Price = 99, MaxMenuItems = 1000, MaxUsers = 20, Features = "[\"Menú Digital\", \"QR Code\", \"Reservaciones\", \"Soporte 24/7\", \"Reportes Avanzados\", \"Multi-sucursal\"]" }
            };
            context.Plans.AddRange(plans);
            context.SaveChanges();

            // Link existing restaurants to Pro Plan if they have no subscription
            var restaurants = context.Restaurants.ToList();
            foreach (var restaurant in restaurants)
            {
                if (!context.Subscriptions.Any(s => s.RestaurantId == restaurant.Id))
                {
                    context.Subscriptions.Add(new Subscription
                    {
                        RestaurantId = restaurant.Id,
                        PlanId = plans[1].Id,
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
