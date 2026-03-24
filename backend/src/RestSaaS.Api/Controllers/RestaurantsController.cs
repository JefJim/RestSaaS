namespace RestSaaS.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.Entities;
using RestSaaS.Core.Interfaces;
using RestSaaS.Infrastructure.Data;

[ApiController]
[Route("api/[controller]")]
public class RestaurantsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantService _tenantService;

    public RestaurantsController(ApplicationDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyRestaurant()
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized(new { Message = "No active tenant mapped to this user token." });

        var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.Id == tenantId.Value);

        if (restaurant == null) return NotFound();

        return Ok(new {
            Id = restaurant.Id,
            Name = restaurant.Name,
            Slug = restaurant.Slug,
            IsActive = restaurant.IsActive,
            CreatedAt = restaurant.CreatedAt
        });
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateRestaurant([FromBody] UpdateRestaurantDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized(new { Message = "No active tenant mapped to this user token." });

        var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.Id == tenantId.Value);
        if (restaurant == null) return NotFound();

        restaurant.Name = dto.Name;
        // Basic slug sanitization
        restaurant.Slug = dto.Slug.ToLower().Replace(" ", "").Replace("'", "").Replace("-", "");

        await _context.SaveChangesAsync();
        
        return Ok(new {
            Id = restaurant.Id,
            Name = restaurant.Name,
            Slug = restaurant.Slug,
            IsActive = restaurant.IsActive,
            CreatedAt = restaurant.CreatedAt
        });
    }
}

public class UpdateRestaurantDto 
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
}
