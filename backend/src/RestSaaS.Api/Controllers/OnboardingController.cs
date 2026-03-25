using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RestSaaS.Core.Entities;
using RestSaaS.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace RestSaaS.Api.Controllers;

[ApiController]
[Route("api/onboarding")]
[Authorize]
public class OnboardingController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config; // Injected IConfiguration

    public OnboardingController(ApplicationDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
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
            Description = request.Description,
            PrimaryColor = request.PrimaryColor,
            OwnerUserId = user.Id
        };
        _context.Restaurants.Add(restaurant);
        await _context.SaveChangesAsync(); // Save to get restaurant.Id

        // 3. Create Default Branch
        var branch = new Branch
        {
            Name = "Principal",
            RestaurantId = restaurant.Id,
            Address = request.Address ?? string.Empty,
            Phone = request.Phone ?? string.Empty,
            IsActive = true
        };
        _context.Branches.Add(branch);

        // 4. Create Settings
        var settings = new Settings
        {
            RestaurantId = restaurant.Id,
            BranchId = branch.Id,
            ContactPhone = request.Phone ?? string.Empty,
            Address = request.Address ?? string.Empty,
            ContactEmail = user.Email
        };
        _context.Settings.Add(settings);

        // 5. Create Menu
        var menu = new Menu
        {
            Name = "Carta Principal",
            RestaurantId = restaurant.Id,
            BranchId = branch.Id,
            IsActive = true
        };
        _context.Menus.Add(menu);

        // 6. Create Default Category
        var category = new MenuCategory
        {
            Name = "General",
            Menu = menu,
            RestaurantId = restaurant.Id,
            BranchId = branch.Id,
            DisplayOrder = 0
        };
        _context.MenuCategories.Add(category);

        // 7. Link User to Restaurant
        var userRestaurant = new UserRestaurant
        {
            UserId = userId,
            RestaurantId = restaurant.Id,
            Role = "Owner"
        };
        _context.UserRestaurants.Add(userRestaurant);

        // 8. Create Subscription (Phase 1.2.3)
        var planName = request.PlanId.ToLower() switch
        {
            "pro" => "Pro Tier",
            "premium" => "Premium",
            _ => "Core / Basic"
        };

        var plan = await _context.Plans.FirstOrDefaultAsync(p => p.Name == planName)
                   ?? await _context.Plans.FirstOrDefaultAsync(); // Fallback to first available

        if (plan == null)
        {
            return StatusCode(500, new { Message = "El sistema de planes no está inicializado. Contacte al administrador." });
        }

        var subscription = new Subscription
        {
            RestaurantId = restaurant.Id,
            PlanId = plan.Id,
            StartDate = DateTime.UtcNow,
            Status = "Active",
            IsActive = true
        };

        // Apply 14-day trial for Basic plan
        if (request.PlanId.ToLower() == "basic" || request.PlanId.ToLower() == "free")
        {
            subscription.EndDate = DateTime.UtcNow.AddDays(14);
            subscription.Status = "Trial";
        }

        _context.Subscriptions.Add(subscription);

        // 9. Update User Status
        user.OnboardingCompleted = true;
        
        await _context.SaveChangesAsync();

        // 10. Generate New Token with RestaurantId and BranchId
        var token = GenerateJwtToken(user, restaurant.Id, branch.Id);
 
        return Ok(new { 
            Message = "Onboarding completado con éxito.", 
            RestaurantSlug = restaurant.Slug,
            Token = token
        });
    }
 
    private string GenerateJwtToken(User user, Guid restaurantId, Guid branchId)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.PlatformRole),
            new Claim("RestaurantId", restaurantId.ToString()),
            new Claim("BranchId", branchId.ToString()),
            new Claim("RestaurantRole", "Owner")
        };
 
        var jwtSettings = _config.GetSection("JwtSettings");
        var secret = jwtSettings["Secret"] ?? "SuperSecretKeyForDevelopmentAndTestingOnly!123";
        var issuer = jwtSettings["Issuer"] ?? "RestSaaS";
        var audience = jwtSettings["Audience"] ?? "RestSaaS";
 
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
 
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );
 
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class OnboardingRequest
{
    public string RestaurantName { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? Cuisine { get; set; }
    public string? Description { get; set; }
    public string? PrimaryColor { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string PlanId { get; set; } = "free";
}
