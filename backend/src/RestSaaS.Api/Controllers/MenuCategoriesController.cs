namespace RestSaaS.Api.Controllers;

using Microsoft.AspNetCore.Authorization;
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
[Route("api/menu/categories")]
[Authorize]
public class MenuCategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantService _tenantService;

    public MenuCategoriesController(ApplicationDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized(new { Message = "No se pudo identificar el restaurante." });

        var categories = await _context.MenuCategories
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();

        return Ok(categories);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized(new { Message = "No se pudo identificar el restaurante." });

        // Find or Create Menu
        var menu = await _context.Menus.FirstOrDefaultAsync(m => m.RestaurantId == tenantId.Value && m.IsActive);
        if (menu == null)
        {
            menu = new Menu { Name = "Carta Principal", RestaurantId = tenantId.Value, IsActive = true };
            _context.Menus.Add(menu);
            await _context.SaveChangesAsync();
        }

        var category = new MenuCategory
        {
            RestaurantId = tenantId.Value,
            MenuId = menu.Id,
            Name = dto.Name,
            DisplayOrder = dto.DisplayOrder
        };

        _context.MenuCategories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CreateCategoryRequest dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized(new { Message = "No se pudo identificar el restaurante." });

        var category = await _context.MenuCategories.FindAsync(id);
        if (category == null) return NotFound();

        category.Name = dto.Name;
        category.DisplayOrder = dto.DisplayOrder;

        await _context.SaveChangesAsync();

        return Ok(category);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized(new { Message = "No se pudo identificar el restaurante." });

        var category = await _context.MenuCategories.FindAsync(id);
        if (category == null) return NotFound();

        _context.MenuCategories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 0;
}
