using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.Entities;
using RestSaaS.Infrastructure.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace RestSaaS.Api.Controllers;

[ApiController]
[Route("api/branches/{branchId}/overrides")]
[Authorize]
public class BranchOverridesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BranchOverridesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetOverrides(Guid branchId)
    {
        var overrides = await _context.BranchMenuOverrides
            .Where(o => o.BranchId == branchId)
            .Select(o => new {
                o.Id,
                o.MenuItemId,
                o.PriceOverride,
                o.IsAvailableOverride
            })
            .ToListAsync();
        return Ok(overrides);
    }

    [HttpPost]
    public async Task<IActionResult> SetOverride(Guid branchId, [FromBody] SetBranchOverrideRequest dto)
    {
        var item = await _context.MenuItems.IgnoreQueryFilters().FirstOrDefaultAsync(i => i.Id == dto.MenuItemId);
        if (item == null) return NotFound("Menu item not found.");

        var existing = await _context.BranchMenuOverrides
            .FirstOrDefaultAsync(o => o.BranchId == branchId && o.MenuItemId == dto.MenuItemId);

        if (existing == null)
        {
            existing = new BranchMenuOverride
            {
                BranchId = branchId,
                MenuItemId = dto.MenuItemId,
                RestaurantId = item.RestaurantId // Linked to restaurant for tenant filter
            };
            _context.BranchMenuOverrides.Add(existing);
        }

        existing.PriceOverride = dto.PriceOverride;
        existing.IsAvailableOverride = dto.IsAvailableOverride;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }
}

public class SetBranchOverrideRequest
{
    public Guid MenuItemId { get; set; }
    public decimal? PriceOverride { get; set; }
    public bool? IsAvailableOverride { get; set; }
}
