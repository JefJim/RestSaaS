namespace RestSaaS.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Infrastructure.Data;
using RestSaaS.Core.Entities;

[ApiController]
[Route("api/[controller]")]
public class PlansController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PlansController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlans()
    {
        var plans = await _context.Plans.Where(p => p.IsActive).ToListAsync();
        return Ok(plans);
    }
}
