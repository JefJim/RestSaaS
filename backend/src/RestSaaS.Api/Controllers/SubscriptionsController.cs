namespace RestSaaS.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Infrastructure.Data;
using RestSaaS.Core.Entities;
using RestSaaS.Core.Interfaces;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantService _tenantService;

    public SubscriptionsController(ApplicationDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentSubscription()
    {
        var subscription = await _context.Subscriptions
            .Include(s => s.Plan)
            .OrderByDescending(s => s.StartDate)
            .FirstOrDefaultAsync();

        if (subscription == null) return NotFound("No se encontró una suscripción activa.");

        return Ok(subscription);
    }

    [HttpPost("subscribe/{planId}")]
    public async Task<IActionResult> UpdateSubscription(Guid planId)
    {
        var plan = await _context.Plans.FindAsync(planId);
        if (plan == null) return NotFound("Plan no encontrado.");

        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized();

        // Deactivate previous subscriptions
        var activeSubscriptions = await _context.Subscriptions
            .Where(s => s.IsActive)
            .ToListAsync();
            
        foreach(var sub in activeSubscriptions)
        {
            sub.IsActive = false;
            sub.Status = "Canceled";
            sub.EndDate = DateTime.UtcNow;
        }

        var newSubscription = new Subscription
        {
            RestaurantId = tenantId.Value,
            PlanId = planId,
            StartDate = DateTime.UtcNow,
            IsActive = true,
            Status = "Active"
        };

        _context.Subscriptions.Add(newSubscription);
        await _context.SaveChangesAsync();

        return Ok(newSubscription);
    }
}
