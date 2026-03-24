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

        return Ok(menu);
    }

    [HttpPost]
    public async Task<IActionResult> CreateMenu([FromBody] CreateMenuDto dto)
    {
        var menu = new Menu { Name = dto.Name };
        _context.Menus.Add(menu);
        await _context.SaveChangesAsync();
        return Ok(menu);
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
        return Ok(category);
    }

    [HttpPost("items")]
    public async Task<IActionResult> CreateItem([FromBody] CreateMenuItemDto dto)
    {
        var item = new MenuItem
        {
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            ImageUrl = dto.ImageUrl,
            IsAvailable = true
        };
        _context.MenuItems.Add(item);
        await _context.SaveChangesAsync();
        return Ok(item);
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
