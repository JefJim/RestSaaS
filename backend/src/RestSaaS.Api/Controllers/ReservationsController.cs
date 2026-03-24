using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestSaaS.Core.DTOs;
using RestSaaS.Core.Entities;
using RestSaaS.Core.Interfaces;
using RestSaaS.Infrastructure.Data;

namespace RestSaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReservationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantService _tenantService;

    public ReservationsController(ApplicationDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<IActionResult> GetReservations()
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (string.IsNullOrEmpty(tenantId))
            return BadRequest("No tenant context");

        var reservations = await _context.Reservations
            .Where(r => r.RestaurantId.ToString() == tenantId)
            .OrderByDescending(r => r.ReservationTime)
            .Select(r => new ReservationDto
            {
                Id = r.Id,
                CustomerName = r.CustomerName,
                CustomerPhone = r.CustomerPhone,
                CustomerEmail = r.CustomerEmail,
                PartySize = r.PartySize,
                ReservationTime = r.ReservationTime,
                Status = r.Status,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(reservations);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateReservationStatus(Guid id, [FromBody] UpdateReservationStatusDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (string.IsNullOrEmpty(tenantId))
            return BadRequest("No tenant context");

        var reservation = await _context.Reservations
            .FirstOrDefaultAsync(r => r.Id == id && r.RestaurantId.ToString() == tenantId);

        if (reservation == null)
            return NotFound("Reservation not found");

        // Validate status
        var validStatuses = new[] { "Pending", "Confirmed", "Cancelled", "Completed" };
        if (!validStatuses.Contains(dto.Status))
            return BadRequest("Invalid status");

        reservation.Status = dto.Status;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Reservation status updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReservation(Guid id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (string.IsNullOrEmpty(tenantId))
            return BadRequest("No tenant context");

        var reservation = await _context.Reservations
            .FirstOrDefaultAsync(r => r.Id == id && r.RestaurantId.ToString() == tenantId);

        if (reservation == null)
            return NotFound("Reservation not found");

        _context.Reservations.Remove(reservation);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}