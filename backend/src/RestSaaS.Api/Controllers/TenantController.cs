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

        var dto = new PublicRestaurantDto
        {
            Id = restaurant.Id,
            Name = restaurant.Name,
            Slug = restaurant.Slug,
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
    public async Task<IActionResult> GetPublicMenu(string slug)
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

        var dto = new PublicMenuDto
        {
            Id = menu.Id,
            Name = menu.Name,
            Categories = menu.Categories
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new PublicCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    DisplayOrder = c.DisplayOrder,
                    Items = c.Items
                        .Where(i => i.IsAvailable)
                        .Select(i => new PublicMenuItemDto
                        {
                            Id = i.Id,
                            Name = i.Name,
                            Description = i.Description,
                            Price = i.Price,
                            ImageUrl = i.ImageUrl,
                            IsAvailable = i.IsAvailable
                        }).ToList()
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