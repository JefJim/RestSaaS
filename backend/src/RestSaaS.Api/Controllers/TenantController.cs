using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.DTOs;
using RestSaaS.Core.Entities;
using RestSaaS.Infrastructure.Data;

namespace RestSaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TenantController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TenantController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetPublicRestaurant(string slug)
    {
        var restaurant = await _context.Restaurants
            .Include(r => r.Settings)
            .Include(r => r.OpeningHours)
            .FirstOrDefaultAsync(r => r.Slug == slug && r.IsActive);

        if (restaurant == null)
            return NotFound("Restaurant not found");

        // Fetch Branches
        var branches = await _context.Branches
            .Where(b => b.RestaurantId == restaurant.Id && b.IsActive)
            .Select(b => new { b.Id, b.Name, b.Address })
            .ToListAsync();

        var dto = new PublicRestaurantDto
        {
            Id = restaurant.Id,
            Name = restaurant.Name,
            Slug = restaurant.Slug,
            Branches = branches.Select(b => new PublicBranchDto { Id = b.Id, Name = b.Name, Address = b.Address }).ToList(),
            Settings = restaurant.Settings != null ? new RestaurantSettingsDto
            {
                ContactEmail = restaurant.Settings.ContactEmail,
                ContactPhone = restaurant.Settings.ContactPhone,
                WhatsAppNumber = restaurant.Settings.WhatsAppNumber,
                Address = restaurant.Settings.Address,
                ThemeConfig = restaurant.Settings.ThemeConfig
            } : new RestaurantSettingsDto(),
            OpeningHours = restaurant.OpeningHours.Select(oh => new OpeningHourDto
            {
                DayOfWeek = oh.DayOfWeek,
                DayName = GetDayName(oh.DayOfWeek),
                OpenTime = oh.OpenTime,
                CloseTime = oh.CloseTime
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpGet("{slug}/menu")]
    public async Task<IActionResult> GetPublicMenu(string slug, [FromQuery] Guid? branchId = null)
    {
        var restaurant = await _context.Restaurants
            .FirstOrDefaultAsync(r => r.Slug == slug && r.IsActive);

        if (restaurant == null)
            return NotFound("Restaurant not found");

        var menu = await _context.Menus
            .Include(m => m.Categories)
                .ThenInclude(c => c.Items)
            .Where(m => m.RestaurantId == restaurant.Id && m.IsActive)
            .FirstOrDefaultAsync();

        if (menu == null)
            return NotFound("Menu not found");

        var overrides = branchId.HasValue
            ? await _context.BranchMenuOverrides
                .Where(o => o.BranchId == branchId.Value)
                .ToListAsync()
            : new System.Collections.Generic.List<RestSaaS.Core.Entities.BranchMenuOverride>();

        var dto = new PublicMenuDto
        {
            Id = menu.Id,
            Name = menu.Name,
            Categories = menu.Categories
                .OrderBy(c => c.DisplayOrder)
                .Select(c => {
                    var categoryItems = c.Items.Select(i => {
                        var ovr = overrides.FirstOrDefault(o => o.MenuItemId == i.Id);
                        return new PublicMenuItemDto
                        {
                            Id = i.Id,
                            Name = i.Name,
                            Description = i.Description,
                            Price = ovr?.PriceOverride ?? i.BasePrice,
                            ImageUrl = i.ImageUrl,
                            IsAvailable = ovr?.IsAvailableOverride ?? i.IsAvailable
                        };
                    })
                    .Where(i => i.IsAvailable)
                    .ToList();

                    return new PublicCategoryDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        DisplayOrder = c.DisplayOrder,
                        Items = categoryItems
                    };
                }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost("{slug}/reservations")]
    public async Task<IActionResult> CreateReservation(string slug, [FromBody] CreateReservationDto dto)
    {
        var restaurant = await _context.Restaurants
            .FirstOrDefaultAsync(r => r.Slug == slug && r.IsActive);

        if (restaurant == null)
            return NotFound("Restaurant not found");

        var reservation = new Reservation
        {
            RestaurantId = restaurant.Id,
            BranchId = dto.BranchId, // BranchId is now required or handled
            CustomerName = dto.CustomerName,
            CustomerPhone = dto.CustomerPhone,
            CustomerEmail = dto.CustomerEmail,
            PartySize = dto.PartySize,
            ReservationTime = dto.ReservationTime,
            Status = "Pending"
        };

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Reservation request submitted successfully" });
    }

    private string GetDayName(int dayOfWeek)
    {
        return dayOfWeek switch
        {
            0 => "Domingo",
            1 => "Lunes",
            2 => "Martes",
            3 => "Miércoles",
            4 => "Jueves",
            5 => "Viernes",
            6 => "Sábado",
            _ => "Desconocido"
        };
    }
}