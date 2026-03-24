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
using Google.Apis.Auth;
using RestSaaS.Api.Dtos;

namespace RestSaaS.Api.Controllers;

[ApiController]
[Route("api/auth")]
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

        // 1. Create User Only
        var user = new User
        {
            Email = request.Email,
            Name = request.Email.Split('@')[0], // Default name
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "User",
            OnboardingCompleted = false 
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user, null);
        return Ok(new { 
            Token = token, 
            OnboardingCompleted = user.OnboardingCompleted 
        });
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
        
        return Ok(new { 
            Token = token,
            OnboardingCompleted = user.OnboardingCompleted 
        });
    }

    [HttpGet("test")] 
    public IActionResult Test() => Ok(new { Message = "Auth Controller is reachable at api/auth/test" });

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
    {
        try
        {
            User? user = null;
            string email = "";
            string oauthId = "";
            string? name = null;
            string? picture = null;

            if (!string.IsNullOrEmpty(dto.IdToken))
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _config["Google:ClientId"] }
                };
                var payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, settings);
                email = payload.Email;
                oauthId = payload.Subject;
                name = payload.Name;
                picture = payload.Picture;
            }
            else if (!string.IsNullOrEmpty(dto.AccessToken))
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", dto.AccessToken);
                var response = await client.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");
                
                if (!response.IsSuccessStatusCode)
                    return BadRequest(new { Message = "Token de acceso de Google inválido." });

                var userInfo = await response.Content.ReadFromJsonAsync<GoogleUserInfo>();
                if (userInfo == null) return BadRequest(new { Message = "No se pudo obtener la información de usuario." });
                email = userInfo.Email;
                oauthId = userInfo.Sub;
                name = userInfo.Name;
                picture = userInfo.Picture;
            }
            else
            {
                return BadRequest(new { Message = "Se requiere IdToken o AccessToken." });
            }
            
            // Sync user
            user = await _context.Users
                .Include(u => u.UserRestaurants)
                .FirstOrDefaultAsync(u => u.OAuthProvider == "Google" && u.OAuthId == oauthId);

            if (user == null)
            {
                user = await _context.Users
                    .Include(u => u.UserRestaurants)
                    .FirstOrDefaultAsync(u => u.Email == email);

                if (user == null)
                {
                    user = new User
                    {
                        Email = email,
                        Name = name ?? email,
                        ProfilePicture = picture,
                        OAuthProvider = "Google",
                        OAuthId = oauthId,
                        Role = "User",
                        OnboardingCompleted = false
                    };
                    _context.Users.Add(user);
                }
                else
                {
                    user.OAuthProvider = "Google";
                    user.OAuthId = oauthId;
                    if (string.IsNullOrEmpty(user.Name)) user.Name = name ?? user.Email;
                    user.ProfilePicture = picture ?? user.ProfilePicture;
                }
                await _context.SaveChangesAsync();
            }

            var primaryRestaurantId = user.UserRestaurants.FirstOrDefault()?.RestaurantId;
            var token = GenerateJwtToken(user, primaryRestaurantId);

            return Ok(new { 
                Token = token,
                OnboardingCompleted = user.OnboardingCompleted 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Error en la autenticación con Google.", Detail = ex.Message });
        }
    }

    private class GoogleUserInfo
    {
        public string Sub { get; set; } = "";
        public string Email { get; set; } = "";
        public string Name { get; set; } = "";
        public string Picture { get; set; } = "";
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
