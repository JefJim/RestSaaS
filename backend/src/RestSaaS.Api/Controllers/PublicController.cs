namespace RestSaaS.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Infrastructure.Data;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/public")]
public class PublicController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PublicController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetRestaurantBySlug(string slug)
    {
        var restaurant = await _context.Restaurants
            .FirstOrDefaultAsync(r => r.Slug == slug.ToLower());

        if (restaurant == null) return NotFound(new { Message = "Restaurante no encontrado." });

        if (!restaurant.IsActive) return BadRequest(new { Message = "Este restaurante no está activo." });

        // Fetch Menu and Items
        var menu = await _context.Menus
            .Where(m => m.RestaurantId == restaurant.Id && m.IsActive)
            .Include(m => m.Categories)
            .FirstOrDefaultAsync();

        if (menu != null)
        {
            await _context.Entry(menu)
                .Collection(m => m.Categories)
                .Query()
                .Include(c => c.Items)
                .LoadAsync();
        }

        return Ok(new {
            Restaurant = new {
                restaurant.Id,
                restaurant.Name,
                restaurant.Slug,
                restaurant.Description,
                restaurant.LogoUrl,
                restaurant.PrimaryColor,
                restaurant.Latitude,
                restaurant.Longitude
            },
            Menu = menu == null ? null : new {
                menu.Id,
                menu.Name,
                Categories = menu.Categories.OrderBy(c => c.DisplayOrder).Select(c => new {
                    c.Id,
                    c.Name,
                    Items = c.Items.Where(i => i.IsAvailable).Select(i => new {
                        i.Id,
                        i.Name,
                        i.Description,
                        i.Price,
                        i.ImageUrl
                    }).ToList()
                }).ToList()
            }
        });
    }
}
