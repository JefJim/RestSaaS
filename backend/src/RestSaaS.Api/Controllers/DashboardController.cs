using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.Interfaces;
using RestSaaS.Infrastructure.Data;
using System.Security.Claims;

namespace RestSaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantService _tenantService;

    public DashboardController(ApplicationDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var restaurantId = _tenantService.GetCurrentTenantId();
        if (!restaurantId.HasValue) return BadRequest("No restaurant context.");

        // Note: Global query filters in ApplicationDbContext automatically handle RestaurantId and BranchId
        
        var menuCount = await _context.MenuItems.CountAsync();
        var reservationsToday = await _context.Reservations
            .CountAsync(r => r.ReservationTime.Date == DateTime.UtcNow.Date);
        var ordersToday = await _context.Orders
            .CountAsync(o => o.CreatedAt.Date == DateTime.UtcNow.Date);

        var subscription = await _context.Subscriptions
            .Include(s => s.Plan)
            .Where(s => s.IsActive)
            .Select(s => new {
                PlanName = s.Plan.Name,
                Status = s.Status,
                EndDate = s.EndDate,
                IsTrial = false // Mocked for now
            })
            .FirstOrDefaultAsync() ?? new {
                PlanName = "Free",
                Status = "Active",
                EndDate = (DateTime?)null,
                IsTrial = false
            };

        return Ok(new
        {
            menuCount,
            reservationsToday,
            ordersToday,
            isActive = true, // We can add business logic here
            subscription
        });
    }
}
