namespace RestSaaS.Api.Middleware;

using Microsoft.AspNetCore.Http;
using RestSaaS.Core.Interfaces;
using System.Security.Claims;

public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;

    public TenantResolutionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantService tenantService)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var restaurantIdClaim = context.User.FindFirst("RestaurantId")?.Value;
            if (Guid.TryParse(restaurantIdClaim, out var restaurantId))
            {
                tenantService.SetCurrentTenantId(restaurantId);
            }
        }
        else if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantIdStr))
        {
            if (Guid.TryParse(tenantIdStr, out var restaurantId))
            {
                tenantService.SetCurrentTenantId(restaurantId);
            }
        }

        await _next(context);
    }
}
