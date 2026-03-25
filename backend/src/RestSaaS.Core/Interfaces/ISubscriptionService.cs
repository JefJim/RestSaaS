using RestSaaS.Core.Entities;
using System;
using System.Threading.Tasks;

namespace RestSaaS.Core.Interfaces;

public interface ISubscriptionService
{
    Task<Plan> GetPlanAsync(Guid restaurantId);
    Task<(bool Success, string Message)> ValidateLimitAsync(Guid restaurantId, string limitType);
}
