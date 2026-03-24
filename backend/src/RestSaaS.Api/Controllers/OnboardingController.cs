using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.Entities;
using RestSaaS.Infrastructure.Data;
using System.Security.Claims;

namespace RestSaaS.Api.Controllers;

[ApiController]
[Route("api/onboarding")]
[Authorize]
public class OnboardingController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public OnboardingController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("complete")]
    public async Task<IActionResult> CompleteOnboarding([FromBody] OnboardingRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _context.Users
            .Include(u => u.UserRestaurants)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound("Usuario no encontrado.");
        if (user.OnboardingCompleted) return BadRequest("El usuario ya completó el onboarding.");

        // 1. Validate Slug Unique
        if (await _context.Restaurants.AnyAsync(r => r.Slug == request.Slug))
            return BadRequest(new { Message = "La URL del restaurante ya está en uso." });

        // 2. Create Restaurant
        var restaurant = new Restaurant
        {
            Name = request.RestaurantName,
            Slug = request.Slug,
            LogoUrl = request.LogoUrl,
            Description = request.Cuisine, // Using cuisine as part of description for now
            // Add other fields if available in Restaurant entity
        };
        _context.Restaurants.Add(restaurant);

        // 3. Link User to Restaurant
        var userRestaurant = new UserRestaurant
        {
            UserId = userId,
            Restaurant = restaurant,
            AssignedRole = "RestaurantOwner"
        };
        _context.UserRestaurants.Add(userRestaurant);

        // 4. Create Default Category
        var category = new MenuCategory
        {
            Name = "General",
            Restaurant = restaurant,
            Order = 0
        };
        _context.MenuCategories.Add(category);

        // 5. Update User Status
        user.OnboardingCompleted = true;
        
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Onboarding completado con éxito.", RestaurantSlug = restaurant.Slug });
    }
}

public class OnboardingRequest
{
    public string RestaurantName { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string Cuisine { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PlanId { get; set; } = "free";
}
