namespace RestSaaS.Api.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.Entities;
using RestSaaS.Core.Interfaces;
using RestSaaS.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/menu/items")]
[Authorize]
public class MenuItemsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly IFileUploadService _fileUploadService;
    private readonly ISubscriptionService _subscriptionService;

    public MenuItemsController(ApplicationDbContext context, ITenantService tenantService, IFileUploadService fileUploadService, ISubscriptionService subscriptionService)
    {
        _context = context;
        _tenantService = tenantService;
        _fileUploadService = fileUploadService;
        _subscriptionService = subscriptionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetItems(Guid? categoryId = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized();

        var query = _context.MenuItems.AsQueryable();
        if (categoryId.HasValue) query = query.Where(i => i.CategoryId == categoryId.Value);

        var items = await query.ToListAsync();
        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> CreateItem([FromForm] CreateMenuItemRequest dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized();

        // Check Subscription Limits
        var (allowed, message) = await _subscriptionService.ValidateLimitAsync(tenantId.Value, "menuitem");
        if (!allowed) return BadRequest(new { Message = message });

        if (dto.ImageFile != null)
        {
            var (imgAllowed, imgMsg) = await _subscriptionService.ValidateLimitAsync(tenantId.Value, "images");
            if (!imgAllowed) return BadRequest(new { Message = imgMsg });
        }

        string? imageUrl = null;
        if (dto.ImageFile != null)
        {
            using var stream = dto.ImageFile.OpenReadStream();
            imageUrl = await _fileUploadService.UploadImageAsync(stream, dto.ImageFile.FileName, dto.ImageFile.ContentType);
        }

        var item = new MenuItem
        {
            RestaurantId = tenantId.Value,
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Description = dto.Description ?? string.Empty,
            BasePrice = dto.BasePrice,
            ImageUrl = imageUrl ?? string.Empty,
            IsAvailable = dto.IsAvailable
        };

        _context.MenuItems.Add(item);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetItems), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateItem(Guid id, [FromForm] UpdateMenuItemRequest dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized();

        var item = await _context.MenuItems.FindAsync(id);
        if (item == null) return NotFound();

        if (dto.ImageFile != null)
        {
            using var stream = dto.ImageFile.OpenReadStream();
            item.ImageUrl = await _fileUploadService.UploadImageAsync(stream, dto.ImageFile.FileName, dto.ImageFile.ContentType) ?? string.Empty;
        }

        item.Name = dto.Name;
        item.Description = dto.Description ?? string.Empty;
        item.BasePrice = dto.BasePrice;
        item.IsAvailable = dto.IsAvailable;
        item.CategoryId = dto.CategoryId;

        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized();

        var item = await _context.MenuItems.FindAsync(id);
        if (item == null) return NotFound();

        _context.MenuItems.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateMenuItemRequest
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public IFormFile? ImageFile { get; set; }
    public bool IsAvailable { get; set; } = true;
}

public class UpdateMenuItemRequest : CreateMenuItemRequest { }
