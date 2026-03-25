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

    public async Task<Subscription> CreateSubscriptionAsync(Guid restaurantId, Guid planId, string paymentMethodId, IStripeService stripeService)
    {
        var restaurant = await _context.Restaurants.FindAsync(restaurantId);
        var plan = await _context.Plans.FindAsync(planId);
        
        if (restaurant == null || plan == null)
            throw new ArgumentException("Restaurant or plan not found");

        // Create or get Stripe customer
        if (string.IsNullOrEmpty(restaurant.StripeCustomerId))
        {
            var billingInfo = await _context.BillingInfos.FirstOrDefaultAsync(b => b.RestaurantId == restaurantId);
            var email = billingInfo?.Email ?? $"{restaurant.Slug}@tablehive.com";
            restaurant.StripeCustomerId = await stripeService.CreateCustomerAsync(restaurantId, email, restaurant.Name);
            await _context.SaveChangesAsync();
        }

        // Create Stripe subscription
        var stripePriceId = plan.StripePriceId ?? $"price_{plan.Id.ToString().Replace("-", "")}";
        var stripeSubscriptionId = await stripeService.CreateSubscriptionAsync(
            restaurant.StripeCustomerId, 
            stripePriceId, 
            paymentMethodId);

        // Create local subscription
        var subscription = new Subscription
        {
            RestaurantId = restaurantId,
            PlanId = planId,
            StripeSubscriptionId = stripeSubscriptionId,
            StartDate = DateTime.UtcNow,
            NextBillingDate = DateTime.UtcNow.AddMonths(1),
            IsActive = true,
            Status = "Active"
        };

        _context.Subscriptions.Add(subscription);
        await _context.SaveChangesAsync();

        return subscription;
    }

    public async Task<bool> ChangePlanAsync(Guid restaurantId, Guid newPlanId, string paymentMethodId, IStripeService stripeService)
    {
        var currentSubscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.RestaurantId == restaurantId && s.IsActive);

        if (currentSubscription == null || string.IsNullOrEmpty(currentSubscription.StripeSubscriptionId))
            return false;

        var newPlan = await _context.Plans.FindAsync(newPlanId);
        if (newPlan == null) return false;

        // Update Stripe subscription
        var newStripePriceId = newPlan.StripePriceId ?? $"price_{newPlan.Id.ToString().Replace("-", "")}";
        var success = await stripeService.UpdateSubscriptionAsync(currentSubscription.StripeSubscriptionId, newStripePriceId);

        if (success)
        {
            // Update local subscription
            currentSubscription.PlanId = newPlanId;
            await _context.SaveChangesAsync();
        }

        return success;
    }

    public async Task<bool> CancelSubscriptionAsync(Guid restaurantId, IStripeService stripeService)
    {
        var subscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.RestaurantId == restaurantId && s.IsActive);

        if (subscription == null || string.IsNullOrEmpty(subscription.StripeSubscriptionId))
            return false;

        var success = await stripeService.CancelSubscriptionAsync(subscription.StripeSubscriptionId);

        if (success)
        {
            subscription.IsActive = false;
            subscription.Status = "Cancelled";
            subscription.EndDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return success;
    }
}
