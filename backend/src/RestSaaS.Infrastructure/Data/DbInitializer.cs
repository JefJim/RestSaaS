using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.Entities;

namespace RestSaaS.Infrastructure.Data;

public static class DbInitializer
{
    public static void Initialize(ApplicationDbContext context)
    {
        // Apply migrations
        context.Database.Migrate();

        // Check if restaurants already exist
        if (context.Restaurants.Any())
        {
            return;   // DB has been seeded
        }

        var restaurants = new Restaurant[]
        {
            new Restaurant
            {
                Name = "Pizza Luna",
                Slug = "pizzaluna",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Restaurant
            {
                Name = "Sushi Time",
                Slug = "sushitime",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Restaurants.AddRange(restaurants);
        context.SaveChanges();

        // Add some menu items for Pizza Luna
        var pizzaLuna = restaurants[0];
        
        var menu = new Menu
        {
            RestaurantId = pizzaLuna.Id,
            Name = "Main Menu",
            IsActive = true
        };
        context.Menus.Add(menu);
        context.SaveChanges();

        var category = new MenuCategory
        {
            RestaurantId = pizzaLuna.Id,
            MenuId = menu.Id,
            Name = "Pizzas",
            DisplayOrder = 1
        };
        context.MenuCategories.Add(category);
        context.SaveChanges();

        var items = new MenuItem[]
        {
            new MenuItem
            {
                RestaurantId = pizzaLuna.Id,
                CategoryId = category.Id,
                Name = "Margherita",
                Description = "Fresh mozzarella, basil and tomato sauce",
                Price = 12.99m,
                IsAvailable = true
            },
            new MenuItem
            {
                RestaurantId = pizzaLuna.Id,
                CategoryId = category.Id,
                Name = "Pepperoni",
                Description = "Classic pepperoni with mozzarella",
                Price = 14.99m,
                IsAvailable = true
            }
        };

        context.MenuItems.AddRange(items);
        context.SaveChanges();
    }
}
