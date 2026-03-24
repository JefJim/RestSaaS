using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.Entities;
using RestSaaS.Core.DTOs;
using RestSaaS.Infrastructure.Data;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace RestSaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(ApplicationDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest(new { Message = "El correo ya está en uso." });

        var slug = request.RestaurantName.ToLower().Replace(" ", "").Replace("'", "").Replace("-", "");
        if (await _context.Restaurants.AnyAsync(r => r.Slug == slug))
            return BadRequest(new { Message = "El nombre del restaurante ya está registrado." });

        // 1. Create Restaurant
        var restaurant = new Restaurant
        {
            Name = request.RestaurantName,
            Slug = slug
        };
        _context.Restaurants.Add(restaurant);

        // 2. Create User
        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "User" 
        };
        _context.Users.Add(user);

        // 3. Link User to Restaurant
        var userRestaurant = new UserRestaurant
        {
            User = user,
            Restaurant = restaurant,
            AssignedRole = "RestaurantOwner"
        };
        _context.UserRestaurants.Add(userRestaurant);

        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user, restaurant.Id);
        return Ok(new { Token = token, RestaurantSlug = restaurant.Slug });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRestaurants)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { Message = "Credenciales inválidas." });

        var primaryRestaurantId = user.UserRestaurants.FirstOrDefault()?.RestaurantId;
        var token = GenerateJwtToken(user, primaryRestaurantId);

        return Ok(new { Token = token });
    }

    private string GenerateJwtToken(User user, Guid? restaurantId)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        if (restaurantId.HasValue)
        {
            claims.Add(new Claim("RestaurantId", restaurantId.Value.ToString()));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _config["JwtSettings:Secret"] ?? "SuperSecretKeyForDevelopmentAndTestingOnly!123"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["JwtSettings:Issuer"] ?? "RestSaaS",
            audience: _config["JwtSettings:Audience"] ?? "RestSaaS",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
