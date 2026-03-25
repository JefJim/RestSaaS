using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.Entities;
using RestSaaS.Core.Interfaces;
using RestSaaS.Infrastructure.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace RestSaaS.Infrastructure.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly ApplicationDbContext _context;

    public SubscriptionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Plan> GetPlanAsync(Guid restaurantId)
    {
        var subscription = await _context.Subscriptions
            .IgnoreQueryFilters()
            .Include(s => s.Plan)
            .Where(s => s.RestaurantId == restaurantId && s.IsActive)
            .FirstOrDefaultAsync();

        if (subscription?.Plan != null)
            return subscription.Plan;

        // Fallback to basic plan
        return await _context.Plans
            .OrderBy(p => p.Price)
            .FirstOrDefaultAsync() ?? new Plan { Name = "Free", MaxBranches = 1, MaxMenuItems = 20 };
    }

    public async Task<(bool Success, string Message)> ValidateLimitAsync(Guid restaurantId, string limitType)
    {
        var plan = await GetPlanAsync(restaurantId);
        
        switch (limitType.ToLower())
        {
            case "branch":
                var branchCount = await _context.Branches.IgnoreQueryFilters().CountAsync(b => b.RestaurantId == restaurantId);
                if (branchCount >= plan.MaxBranches)
                    return (false, $"Tu plan actual ({plan.Name}) solo permite {plan.MaxBranches} sucursales.");
                break;

            case "menuitem":
                var itemCount = await _context.MenuItems.IgnoreQueryFilters().CountAsync(i => i.RestaurantId == restaurantId);
                if (itemCount >= plan.MaxMenuItems)
                    return (false, $"Tu plan actual ({plan.Name}) solo permite {plan.MaxMenuItems} platos en el menú.");
                break;

            case "images":
                if (!plan.AllowImages)
                    return (false, $"Tu plan actual ({plan.Name}) no permite subir imágenes.");
                break;

            case "reservations":
                if (!plan.AllowReservations)
                    return (false, $"Tu plan actual ({plan.Name}) no incluye el módulo de reservaciones.");
                break;

            case "orders":
                if (!plan.AllowOrders)
                    return (false, $"Tu plan actual ({plan.Name}) no permite recibir pedidos online.");
                break;
        }

        return (true, string.Empty);
    }
}
