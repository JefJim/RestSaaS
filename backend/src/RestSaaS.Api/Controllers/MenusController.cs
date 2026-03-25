namespace RestSaaS.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.Entities;
using RestSaaS.Core.DTOs;
using RestSaaS.Infrastructure.Data;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MenusController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MenusController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMenus()
    {
        var menus = await _context.Menus
            .Select(m => new MenuDto { Id = m.Id, Name = m.Name, IsActive = m.IsActive })
            .ToListAsync();
        return Ok(menus);
    }

    [HttpGet("{id}/full")]
    public async Task<IActionResult> GetFullMenu(Guid id)
    {
        var menu = await _context.Menus
            .Include(m => m.Categories)
                .ThenInclude(c => c.Items)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (menu == null) return NotFound();

        // Project to DTO to avoid circular navigation property cycles
        var dto = new
        {
            id = menu.Id,
            name = menu.Name,
            isActive = menu.IsActive,
            categories = menu.Categories
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new
                {
                    id = c.Id,
                    name = c.Name,
                    displayOrder = c.DisplayOrder,
                    items = c.Items.Select(i => new
                    {
                        id = i.Id,
                        name = i.Name,
                        description = i.Description,
                        basePrice = i.BasePrice,
                        imageUrl = i.ImageUrl,
                        isAvailable = i.IsAvailable
                    }).ToList()
                }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> CreateMenu([FromBody] CreateMenuDto dto)
    {
        var menu = new Menu { Name = dto.Name };
        _context.Menus.Add(menu);
        await _context.SaveChangesAsync();
        return Ok(new MenuDto { Id = menu.Id, Name = menu.Name, IsActive = menu.IsActive });
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
    {
        var category = new MenuCategory 
        { 
            MenuId = dto.MenuId, 
            Name = dto.Name, 
            DisplayOrder = dto.DisplayOrder 
        };
        _context.MenuCategories.Add(category);
        await _context.SaveChangesAsync();
        return Ok(new CategoryDto { Id = category.Id, Name = category.Name, DisplayOrder = category.DisplayOrder });
    }

    [HttpPost("items")]
    public async Task<IActionResult> CreateItem([FromBody] CreateMenuItemDto dto)
    {
        var item = new MenuItem
        {
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Description = dto.Description,
            BasePrice = dto.BasePrice,
            ImageUrl = dto.ImageUrl,
            IsAvailable = true
        };
        _context.MenuItems.Add(item);
        await _context.SaveChangesAsync();
        return Ok(new MenuItemDto { Id = item.Id, Name = item.Name, Description = item.Description, BasePrice = item.BasePrice, ImageUrl = item.ImageUrl, IsAvailable = item.IsAvailable });
    }

    [HttpPut("{menuId}/items/{itemId}")]
    public async Task<IActionResult> UpdateItem(Guid menuId, Guid itemId, [FromBody] UpdateMenuItemDto dto)
    {
        var item = await _context.MenuItems
            .Include(i => i.Category)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.Category.MenuId == menuId);

        if (item == null) return NotFound();

        item.Name = dto.Name;
        item.Description = dto.Description;
        item.BasePrice = dto.BasePrice;
        item.ImageUrl = dto.ImageUrl;

        await _context.SaveChangesAsync();
        return Ok(new MenuItemDto { Id = item.Id, Name = item.Name, Description = item.Description, BasePrice = item.BasePrice, ImageUrl = item.ImageUrl, IsAvailable = item.IsAvailable });
    }

    [HttpDelete("items/{id}")]
    public async Task<IActionResult> DeleteItem(Guid id)
    {
        var item = await _context.MenuItems.FindAsync(id);
        if (item == null) return NotFound();

        _context.MenuItems.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
