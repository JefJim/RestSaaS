namespace RestSaaS.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.Entities;
using RestSaaS.Core.Interfaces;
using RestSaaS.Infrastructure.Data;
using System.Security.Claims;

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
    public async Task<IActionResult> GetMyActiveRestaurant()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var tenantId = _tenantService.GetCurrentTenantId();
        
        // If no tenant in context, try to find the first one where the user belongs
        if (!tenantId.HasValue)
        {
            var firstRel = await _context.UserRestaurants
                .Include(ur => ur.Restaurant)
                .FirstOrDefaultAsync(ur => ur.UserId == userId);
            
            if (firstRel == null) return NotFound(new { Message = "No se encontraron restaurantes para este usuario." });
            tenantId = firstRel.RestaurantId;
        }

        var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.Id == tenantId.Value);
        if (restaurant == null) return NotFound();

        return Ok(new {
            Id = restaurant.Id,
            Name = restaurant.Name,
            Slug = restaurant.Slug,
            LogoUrl = restaurant.LogoUrl,
            PrimaryColor = restaurant.PrimaryColor,
            IsActive = restaurant.IsActive,
            CreatedAt = restaurant.CreatedAt
        });
    }

    [HttpGet("list")]
    [Authorize]
    public async Task<IActionResult> GetMyRestaurantsList()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var restaurants = await _context.UserRestaurants
            .Where(ur => ur.UserId == userId)
            .Include(ur => ur.Restaurant)
            .Select(ur => new {
                Id = ur.Restaurant.Id,
                Name = ur.Restaurant.Name,
                Slug = ur.Restaurant.Slug,
                Role = ur.Role,
                LogoUrl = ur.Restaurant.LogoUrl
            })
            .ToListAsync();

        return Ok(restaurants);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateNewRestaurant([FromBody] CreateRestaurantDto dto)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        // Validate slug uniqueness
        if (await _context.Restaurants.AnyAsync(r => r.Slug == dto.Slug))
            return BadRequest(new { Message = "La URL del restaurante ya está en uso." });

        var restaurant = new Restaurant
        {
            Name = dto.Name,
            Slug = dto.Slug.ToLower().Trim().Replace(" ", "-"),
            OwnerUserId = userId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Restaurants.Add(restaurant);
        await _context.SaveChangesAsync();

        // Link as Owner
        _context.UserRestaurants.Add(new UserRestaurant
        {
            UserId = userId,
            RestaurantId = restaurant.Id,
            Role = "Owner"
        });

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMyActiveRestaurant), new { id = restaurant.Id }, restaurant);
    }

    [HttpPost("{restaurantId}/staff")]
    [Authorize]
    public async Task<IActionResult> AddStaff(Guid restaurantId, [FromBody] AddStaffDto dto)
    {
        // Check if current user has permission (Owner or Admin)
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var currentRole = await _context.UserRestaurants
            .Where(ur => ur.UserId == userId && ur.RestaurantId == restaurantId)
            .Select(ur => ur.Role)
            .FirstOrDefaultAsync();

        if (currentRole != "Owner" && currentRole != "Admin")
            return Forbid();

        // Find target user by email
        var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (targetUser == null)
            return NotFound(new { Message = "Usuario no encontrado en la plataforma." });

        if (await _context.UserRestaurants.AnyAsync(ur => ur.UserId == targetUser.Id && ur.RestaurantId == restaurantId))
            return BadRequest(new { Message = "El usuario ya forma parte de este restaurante." });

        var newRel = new UserRestaurant
        {
            UserId = targetUser.Id,
            RestaurantId = restaurantId,
            Role = dto.Role // Admin, Staff
        };

        _context.UserRestaurants.Add(newRel);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Personal añadido con éxito." });
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateRestaurant([FromBody] UpdateRestaurantDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized(new { Message = "No se pudo identificar el restaurante." });

        var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.Id == tenantId.Value);
        if (restaurant == null) return NotFound();

        restaurant.Name = dto.Name;
        if (!string.IsNullOrEmpty(dto.Slug))
            restaurant.Slug = dto.Slug.ToLower().Trim().Replace(" ", "-");
        
        restaurant.LogoUrl = dto.LogoUrl ?? restaurant.LogoUrl;
        restaurant.PrimaryColor = dto.PrimaryColor ?? restaurant.PrimaryColor;
        restaurant.Description = dto.Description ?? restaurant.Description;

        await _context.SaveChangesAsync();
        
        return Ok(restaurant);
    }
}

public class UpdateRestaurantDto 
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? PrimaryColor { get; set; }
    public string? Description { get; set; }
}

public class CreateRestaurantDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
}

public class AddStaffDto
{
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Staff"; // Admin, Staff
}
