using RestSaaS.Core.Entities;
using System;
using System.Threading.Tasks;

namespace RestSaaS.Core.Interfaces;

public interface ISubscriptionService
{
    Task<Plan> GetPlanAsync(Guid restaurantId);
    Task<(bool Success, string Message)> ValidateLimitAsync(Guid restaurantId, string limitType);
    
    // Subscription Management
    Task<Subscription> CreateSubscriptionAsync(Guid restaurantId, Guid planId, string paymentMethodId, IStripeService stripeService);
    Task<bool> ChangePlanAsync(Guid restaurantId, Guid newPlanId, string paymentMethodId, IStripeService stripeService);
    Task<bool> CancelSubscriptionAsync(Guid restaurantId, IStripeService stripeService);
}
