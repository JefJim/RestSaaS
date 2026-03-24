using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Infrastructure.Data;
using RestSaaS.Core.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized(new { Message = "No se pudo identificar el restaurante." });

        // Today's date range (UTC)
        var today = DateTime.UtcNow.Date;

        var menuCount = await _context.MenuItems.CountAsync();
        var reservationsToday = await _context.Reservations.CountAsync(r => r.ReservationTime.Date == today);
        var ordersToday = await _context.Orders.CountAsync(o => o.CreatedAt.Date == today);

        var subscription = await _context.Subscriptions
            .Include(s => s.Plan)
            .OrderByDescending(s => s.StartDate)
            .FirstOrDefaultAsync();

        var restaurant = await _context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == tenantId.Value);

        return Ok(new
        {
            MenuCount = menuCount,
            ReservationsToday = reservationsToday,
            OrdersToday = ordersToday,
            IsActive = restaurant?.IsActive ?? false,
            Subscription = new
            {
                PlanName = subscription?.Plan?.Name ?? "Sin Plan",
                Status = subscription?.Status ?? "Inactivo",
                EndDate = subscription?.EndDate,
                IsTrial = subscription?.Status == "Trial"
            }
        });
    }
}
