namespace RestSaaS.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Infrastructure.Data;
using RestSaaS.Core.Entities;
using RestSaaS.Core.Interfaces;

[ApiController]
[Route("api/subscriptions")]
[Authorize]
public class SubscriptionsController : ControllerBase
{
    private readonly RestSaaS.Core.Interfaces.IBillingService _billingService;
    private readonly ApplicationDbContext _context;
    private readonly RestSaaS.Core.Interfaces.ITenantService _tenantService;

    public SubscriptionsController(ApplicationDbContext context, RestSaaS.Core.Interfaces.ITenantService tenantService, RestSaaS.Core.Interfaces.IBillingService billingService)
    {
        _context = context;
        _tenantService = tenantService;
        _billingService = billingService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentSubscription()
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return NotFound("No tenant context.");

        var subscription = await _context.Subscriptions
            .Include(s => s.Plan)
            .Where(s => s.RestaurantId == tenantId.Value)
            .OrderByDescending(s => s.StartDate)
            .FirstOrDefaultAsync();

        if (subscription == null) return NotFound("No se encontró una suscripción activa.");

        return Ok(subscription);
    }

    [HttpGet("test")]
    public IActionResult TestRoute() => Ok(new { message = "Subscriptions controller is reachable!" });

    [HttpPost("change-plan")]
    public async Task<IActionResult> ChangePlan([FromQuery] Guid planId)
    {
        var plan = await _context.Plans.FindAsync(planId);
        if (plan == null) return BadRequest(new { 
            message = "Plan no encontrado.", 
            receivedId = planId, 
            tip = "Asegúrate de haber ejecutado las migraciones y el seeder (DbInitializer.cs)." 
        });

        var restaurantId = _tenantService.GetCurrentTenantId();
        if (!restaurantId.HasValue) return Unauthorized();

        // Deactivate previous subscriptions
        var activeSubscriptions = await _context.Subscriptions
            .Where(s => s.RestaurantId == restaurantId.Value && s.IsActive)
            .ToListAsync();
            
        foreach(var sub in activeSubscriptions)
        {
            sub.IsActive = false;
            sub.Status = "Upgraded";
            sub.EndDate = DateTime.UtcNow;
        }

        var newSubscription = new Subscription
        {
            RestaurantId = restaurantId.Value,
            PlanId = planId,
            StartDate = DateTime.UtcNow,
            NextBillingDate = DateTime.UtcNow.AddMonths(1),
            IsActive = true,
            Status = "Active"
        };

        _context.Subscriptions.Add(newSubscription);
        await _context.SaveChangesAsync();

        // Generate the initial "Trial" invoice for history
        await _billingService.GenerateTrialInvoiceAsync(restaurantId.Value, planId);

        return Ok(newSubscription);
    }
}
